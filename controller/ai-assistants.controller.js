import { AssistantResponse, streamText } from "ai";
// import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

// const openai = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

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
  const currentUserId = input?.user_id;
  console.log(currentUserId);

  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

  // Check for any active runs and cancel them if they exist
  try {
    const runs = await openai.beta.threads.runs.list(threadId);
    const activeRun = runs.data.find((run) =>
      ["in_progress", "queued", "requires_action"].includes(run.status)
    );

    if (activeRun) {
      await openai.beta.threads.runs.cancel(threadId, activeRun.id);
    }
  } catch (error) {
    console.error("Error checking/canceling active runs:", error);
  }

  // Add a message to the thread
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: input.message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      try {
        // Run the assistant on the thread
        const runStream = openai.beta.threads.runs.stream(threadId, {
          assistant_id:
            process.env.ASSISTANT_ID ??
            (() => {
              throw new Error("ASSISTANT_ID is not set");
            })(),
        });

        // forward run status would stream message deltas
        let runResult = await forwardStream(runStream);

        // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
        while (
          runResult?.status === "requires_action" &&
          runResult.required_action?.type === "submit_tool_outputs"
        ) {
          const tool_outputs = await Promise.all(
            runResult.required_action.submit_tool_outputs.tool_calls.map(
              async (toolCall) => {
                const parameters = JSON.parse(toolCall.function.arguments);
                console.log(parameters);
                if (!toolCall.function.name) {
                  throw new Error("Tool call function name is missing");
                }
                switch (toolCall.function.name) {
                  // configure your tool calls here
                  default:
                    throw new Error(
                      `Unknown tool call function: ${toolCall.function.name}`
                    );
                }
              }
            )
          );

          runResult = await forwardStream(
            openai.beta.threads.runs.submitToolOutputsStream(
              threadId,
              runResult.id,
              { tool_outputs }
            )
          );
        }
      } catch (error) {
        console.error("Error in assistant run:", error);
        throw error;
      }
    }
  );
};
