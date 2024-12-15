import { AssistantResponse, streamText } from "ai";
import { getToken } from "next-auth/jwt";
// import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

const makeRequest = async (endpoint, data) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to make request to ${endpoint}`);
  }
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

export const assistant = async (req, res) => {
  // Parse the request body
  const input = await req.json();
  const assistantId = process.env.ASSISTANT_ID;

  const token = await getToken({ req, secret: process.env.SECRET });

  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized" });
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
    id: threadId,
    user_id: currentUser?.sub,
    title: input.message,
    assistant_id: assistantId,
  });

  await saveMessage({
    id: createdMessage.id,
    threadId: threadId,
    content: createdMessage.content[0]?.text?.value,
    role: createdMessage.role,
    user_id: currentUser?.sub,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage, sendMessage }) => {
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
                  const dataUtama = await getDataUtamaSiasn(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(dataUtama),
                  };

                // peserta spt di organisasinya
                case "get_peserta_spt":
                  const pesertaSpt = await getPesertaSpt(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(pesertaSpt),
                  };

                // pejabat di organisasinya
                case "get_pejabat":
                  const pejabat = await cariPejabat(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(pejabat),
                  };

                // generate document spt
                case "generate_document_spt":
                  const documentSpt = await generateDocumentSpt(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(documentSpt),
                  };

                // generate document lupa absen
                case "generate_document_lupa_absen":
                  const documentLupaAbsen = await generateDocumentLupaAbsen(
                    params
                  );
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(documentLupaAbsen),
                  };

                // get data pengguna
                case "get_data_pengguna":
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
