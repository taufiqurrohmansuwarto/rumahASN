import { cariAtasanLangsung } from "@/utils/ai-utils";
import OpenAI from "openai";

// create available function
const availableFunctions = {
  cariAtasanLangsung,
};

const waitForRunCompletion = async (threadId, runId) => {
  let runStatus;
  do {
    runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "failed") {
      throw new Error("Assistant run failed");
    }
    if (runStatus.status === "expired") {
      throw new Error("Assistant run expired");
    }
    if (
      runStatus.status !== "completed" &&
      runStatus.status !== "requires_action"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (
    runStatus.status !== "completed" &&
    runStatus.status !== "requires_action"
  );

  return runStatus;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getChat = async (req, res) => {
  try {
    const { threadId, message } = req.body;
    const { organizationId } = req.user;

    const currentThreadId =
      threadId ?? (await openai.beta.threads.create({})).id;

    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });

    let runStatus;
    do {
      runStatus = await waitForRunCompletion(currentThreadId, run.id);

      if (
        runStatus.status === "requires_action" &&
        runStatus.required_action?.type === "submit_tool_outputs"
      ) {
        const toolCalls =
          runStatus.required_action.submit_tool_outputs.tool_calls;

        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            let functionResult;
            if (functionName in availableFunctions) {
              try {
                functionResult = await availableFunctions[functionName](
                  functionArgs
                );
              } catch (error) {
                console.error(
                  `Error executing function ${functionName}:`,
                  error
                );
                functionResult = { error: error.message };
              }
            } else {
              functionResult = { error: `Function ${functionName} not found` };
            }

            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(functionResult),
            };
          })
        );

        runStatus = await openai.beta.threads.runs.submitToolOutputs(
          currentThreadId,
          run.id,
          { tool_outputs: toolOutputs }
        );
      }
    } while (runStatus.status !== "completed");

    const messages = await openai.beta.threads.messages.list(currentThreadId);
    const latestMessage = messages.data[0];

    return res.json({
      threadId: currentThreadId,
      message: {
        id: latestMessage.id,
        role: latestMessage.role,
        content: latestMessage.content[0].text.value,
      },
      status: "completed",
    });
  } catch (error) {
    console.error("Error in assistant:", error);
    return res.status(500).json({
      error: error.message || "An error occurred",
      status: "error",
    });
  }
};

module.exports = {
  getChat,
};
