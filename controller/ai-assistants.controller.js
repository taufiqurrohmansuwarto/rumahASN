import { AssistantResponse, streamText } from "ai";
import { decode } from "next-auth/jwt";

// import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";
const prod = process.env.NODE_ENV === "production";
const API_KEY = process.env.API_KEY;

const makeRequest = async (endpoint, data) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // use api key
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(`${endpoint} result`, result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to make request to ${endpoint}`);
  }
};

const getHeaderSurat = async (data) => {
  return makeRequest("/tool-services/get-header-surat", data);
};

const cariUsulanSiasn = async (data) => {
  return makeRequest("/tool-services/status-usulan-siasn", data);
};

const saveMessage = async (data) => {
  return makeRequest("/tool-services/messages", data);
};

const saveThread = async (data) => {
  return makeRequest("/tool-services/threads", data);
};

const cariPejabat = async (data) => {
  return makeRequest("/tool-services/get-pejabat", data);
};

const getDataUtamaSiasn = async (data) => {
  return makeRequest("/tool-services/get-data-utama-siasn", data);
};

const getPesertaSpt = async (data) => {
  return makeRequest("/tool-services/get-peserta-spt", data);
};

const generateDocumentSpt = async (data) => {
  return makeRequest("/tool-services/generate-document-spt", data);
};

const generateDocumentLupaAbsen = async (data) => {
  return makeRequest("/tool-services/generate-document-lupa-absen", data);
};

const getDataPengguna = async (data) => {
  return makeRequest("/tool-services/get-data-pengguna", data);
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const maxDuration = 300;

export const botChat = async (req, res) => {
  try {
    const { messages } = await req.json();
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
    });
    const hasil = result.toDataStreamResponse();
    return hasil;
  } catch (error) {
    console.log(error);
  }
};

// Helper function untuk parsing cookie
function getCookieValue(cookieHeader, key) {
  return cookieHeader
    ?.split("; ")
    .find((row) => row.startsWith(key))
    ?.split("=")[1];
}

function parseCookies(cookieHeader) {
  const cookies = {};

  if (cookieHeader) {
    // Pisahkan berdasarkan ';' untuk mendapatkan setiap pasangan cookie
    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.split("="); // Pisahkan nama dan nilai cookie
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    });
  }

  return cookies;
}

export const assistant = async (req, res) => {
  // Parse the request body
  const input = await req.json();
  const assistantId = process.env.ASSISTANT_ID;

  const cookies = req?.headers?.get("cookie");
  const sessionToken = getCookieValue(
    cookies,
    prod ? "__Secure-next-auth.session-token" : "next-auth.session-token"
  );

  const token = await decode({
    token: sessionToken,
    secret: process.env.SECRET,
  });

  if (!token) {
    throw new Error("Unauthorized");
  }

  const currentUser = {
    ...token,
    user_id: token?.sub,
    accessToken: token?.accessToken,
  };

  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

  // Add message to OpenAI thread
  const createdMessage = await openai.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: input.message,
    },
    {
      signal: req?.signal,
    }
  );

  await saveThread({
    ...currentUser,
    id: threadId,
    user_id: currentUser?.sub,
    title: input.message,
    assistant_id: assistantId,
  });

  await saveMessage({
    ...currentUser,
    id: createdMessage.id,
    threadId: threadId,
    content: createdMessage.content[0]?.text?.value,
    role: createdMessage.role,
    user_id: currentUser?.sub,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(
        threadId,
        {
          assistant_id: assistantId,
        },
        {
          signal: req?.signal,
        }
      );

      // Forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

      // Save assistant's response when completed
      if (runResult?.status === "completed") {
        const messages = await openai.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0];
        await saveMessage({
          ...currentUser,
          id: lastMessage?.id,
          threadId: threadId,
          content: lastMessage?.content[0]?.text?.value,
          role: lastMessage?.role,
          user_id: currentUser?.sub,
        });
      }

      // Handle function calls
      while (
        runResult?.status === "requires_action" &&
        runResult.required_action?.type === "submit_tool_outputs"
      ) {
        const toolCallPromises =
          runResult.required_action.submit_tool_outputs.tool_calls.map(
            async (toolCall) => {
              const parameters = JSON.parse(toolCall.function.arguments);
              const params = {
                ...currentUser,
                ...parameters,
              };

              switch (toolCall.function.name) {
                // cari usulan siasn
                case "cari_usulan_siasn":
                  const status = await cariUsulanSiasn(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(status),
                  };

                // dapatkan data pengguna
                case "get_data_utama_siasn":
                  console.log("masuk ke get data utama siasn");
                  const dataUtama = await getDataUtamaSiasn(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(dataUtama),
                  };

                //mendapatkan header surat dari unit kerja pengguna
                case "get_header_surat":
                  console.log("masuk ke get header surat");
                  const headerSurat = await getHeaderSurat(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(headerSurat),
                  };

                // peserta spt di organisasinya
                case "get_peserta_spt":
                  console.log("masuk ke get peserta spt");
                  const pesertaSpt = await getPesertaSpt(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(pesertaSpt),
                  };

                // pejabat di organisasinya
                case "get_pejabat":
                  console.log("masuk ke get pejabat");
                  const pejabat = await cariPejabat(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(pejabat),
                  };

                // generate document spt
                case "generate_document_spt":
                  console.log(
                    "masuk ke generate document spt dengan params",
                    params
                  );
                  const documentSpt = await generateDocumentSpt(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(documentSpt),
                  };

                // generate document lupa absen
                case "generate_document_lupa_absen":
                  console.log(
                    "masuk ke generate document lupa absen dengan params",
                    params
                  );

                  const documentLupaAbsen = await generateDocumentLupaAbsen(
                    params
                  );
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(documentLupaAbsen),
                  };

                // get data pengguna
                case "get_data_pengguna":
                  console.log("masuk ke get data pengguna");
                  const dataPengguna = await getDataPengguna(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(dataPengguna),
                  };

                default:
                  throw new Error(
                    `Unknown tool call function: ${toolCall.function.name}`
                  );
              }
            }
          );

        const tool_outputs = await Promise.all(toolCallPromises);

        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            threadId,
            runResult.id,
            { tool_outputs },
            { signal: req?.signal }
          )
        );

        // Save assistant's response after function call
        if (runResult?.status === "completed") {
          const messages = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messages.data[0];
          await saveMessage({
            ...currentUser,
            id: lastMessage?.id,
            threadId: threadId,
            content: lastMessage?.content[0]?.text?.value,
            role: lastMessage?.role,
            user_id: currentUser?.sub,
          });
        }
      }
    }
  );
};
