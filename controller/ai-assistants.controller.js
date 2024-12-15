import { AssistantResponse, streamText } from "ai";
import { getToken } from "next-auth/jwt";
// import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

const cariUsulanSiasn = async (data) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/tool-services/status-usulan-siasn`;
    const result = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const hasil = await result.json();
    return hasil;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to cari usulan siasn");
  }
};

const saveMessage = async (data) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/tool-services/messages`;
    const result = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const hasil = await result.json();
    return hasil;
  } catch (error) {
    console.log(error);
  }
};

const saveThread = async (data) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/tool-services/threads`;
    const result = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const hasil = await result.json();
    return hasil;
  } catch (error) {
    console.log(error);
  }
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
                case "cari_usulan_siasn":
                  const status = await cariUsulanSiasn(params);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(status),
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
