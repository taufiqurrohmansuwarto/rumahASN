// controllers/chatController.js
import {
  createThread,
  createMessage,
  createRun,
  getMessages,
} from "@/utils/openaiservice";
import { executeToolCall } from "@/utils/toolservice";
import { ChatError } from "@/utils/errors";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Main chat handler
export const handleChat = async (req, res) => {
  try {
    const { threadId, message } = req.body;
    const user = req?.user;

    // Initialize or get thread
    const currentThreadId = await initializeThread(threadId);

    // Process the chat
    const result = await processChatInteraction(currentThreadId, message, user);

    return res.json(result);
  } catch (error) {
    console.error("Chat Controller Error:", error);
    return handleError(res, error);
  }
};

// Initialize thread if not exists
const initializeThread = async (threadId) => {
  try {
    return threadId ?? (await createThread()).id;
  } catch (error) {
    throw new ChatError("Failed to initialize thread", error);
  }
};

// Process the chat interaction
const processChatInteraction = async (threadId, message, user) => {
  try {
    // Create message
    await createMessage(threadId, message);

    // Create and process run
    const run = await createRun(threadId, process.env.ASSISTANT_ID);
    await processRun(threadId, run.id, user);

    // Get and format final message
    const messages = await getMessages(threadId);
    return formatResponse(threadId, messages.data[0]);
  } catch (error) {
    throw new ChatError("Failed to process chat interaction", error);
  }
};

// Process the run and handle tool calls
const processRun = async (threadId, runId, user) => {
  try {
    let runStatus = await waitForRunCompletion(threadId, runId);

    while (runStatus.status !== "completed") {
      if (requiresToolAction(runStatus)) {
        runStatus = await handleToolCalls(threadId, runId, runStatus, user);
      }

      if (isFailedStatus(runStatus.status)) {
        throw new ChatError(`Run failed with status: ${runStatus.status}`);
      }

      await delay(1000); // Prevent too frequent polling
      runStatus = await waitForRunCompletion(threadId, runId);
    }

    return runStatus;
  } catch (error) {
    throw new ChatError("Failed to process run", error);
  }
};

// Handle tool calls
const handleToolCalls = async (threadId, runId, runStatus, user) => {
  try {
    const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
    const toolOutputs = await Promise.all(
      toolCalls.map((toolCall) => processToolCall(toolCall, user))
    );

    return await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
      tool_outputs: toolOutputs,
    });
  } catch (error) {
    throw new ChatError("Failed to handle tool calls", error);
  }
};

// Process individual tool call
const processToolCall = async (toolCall, user) => {
  try {
    const {
      id,
      function: { name, arguments: args },
    } = toolCall;

    const functionArgs = JSON.parse(args);

    const argsWithOrg = {
      ...functionArgs,
      user,
    };

    const result = await executeToolCall(name, argsWithOrg);

    return {
      tool_call_id: id,
      output: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Tool call error: ${error.message}`);
    return {
      tool_call_id: toolCall.id,
      output: JSON.stringify({ error: error.message }),
    };
  }
};

// Helper functions
const formatResponse = (threadId, message) => ({
  threadId,
  message: {
    id: message.id,
    role: message.role,
    content: message.content[0].text.value,
  },
  status: "completed",
});

const requiresToolAction = (runStatus) =>
  runStatus.status === "requires_action" &&
  runStatus.required_action?.type === "submit_tool_outputs";

const isFailedStatus = (status) =>
  ["failed", "cancelled", "expired"].includes(status);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    error: error.message || "An error occurred",
    status: "error",
  });
};

// Wait for run completion
const waitForRunCompletion = async (threadId, runId) => {
  try {
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  } catch (error) {
    throw new ChatError("Failed to retrieve run status", error);
  }
};
