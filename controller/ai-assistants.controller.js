import { AssistantResponse, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 300;

export const botChat = async (req, res) => {
  const { messages } = await req.json();
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages,
  });
  const hasil = result.toDataStreamResponse();
  return hasil;
};

export const assistant = async (req, res) => {
  const threadId =
    req?.body?.threadId ?? (await openai.beta.threads.create()).id;

  const createMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: req?.body?.message,
  });

  return AssistantResponse(
    { threadId, messageId: createMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      const runStream = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.ASSISTANT_ID,
      });

      let runResult = await forwardStream(runStream);
      // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
      while (
        runResult?.status === "requires_action" &&
        runResult.required_action?.type === "submit_tool_outputs"
      ) {
        const tool_outputs =
          runResult.required_action.submit_tool_outputs.tool_calls.map(
            (toolCall) => {
              const parameters = JSON.parse(toolCall.function.arguments);

              switch (toolCall.function.name) {
                // configure your tool calls here

                default:
                  throw new Error(
                    `Unknown tool call function: ${toolCall.function.name}`
                  );
              }
            }
          );

        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            threadId,
            runResult.id,
            { tool_outputs }
          )
        );
      }
    }
  );
};
