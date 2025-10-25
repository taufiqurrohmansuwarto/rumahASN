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
import { chatHistoryService } from "@/utils/chatHistoryService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Main chat handler
export const handleChat = async (req, res) => {
  try {
    const { threadId, message } = req.body;
    const currentUser = req?.user;

    const user = {
      ...currentUser,
      fetcher: req?.fetcher,
      siasnRequest: req?.siasnRequest,
      minio: req?.mc,
    };

    // Initialize or get thread
    const currentThreadId = await initializeThread(threadId);
    const assistantId = req?.query?.assistantId || process.env.ASSISTANT_ID;

    // save thread if new
    if (!threadId) {
      await chatHistoryService.saveThread(
        currentThreadId,
        user.customId,
        message,
        assistantId
      );
    }

    // save message
    await chatHistoryService.saveMessage(
      currentThreadId,
      message,
      "user",
      null,
      user.customId
    );

    // Process the chat
    const result = await processChatInteraction(
      currentThreadId,
      message,
      user,
      assistantId
    );

    // save assistant response
    await chatHistoryService.saveMessage(
      currentThreadId,
      result.message.content,
      "assistant",
      result?.message?.attachments || null,
      user?.customId
    );

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
const processChatInteraction = async (threadId, message, user, assistantId) => {
  try {
    // Create message
    await createMessage(threadId, message);

    // Create and process run
    const run = await createRun(threadId, assistantId);
    const finalRun = await processRun(threadId, run.id, user);

    // Get and format final message
    const messages = await getMessages(threadId);

    if (!messages?.data || messages.data.length === 0) {
      throw new ChatError("No messages found in thread");
    }

    return formatResponse(threadId, messages.data[0]);
  } catch (error) {
    console.error("processChatInteraction error:", error);
    throw new ChatError("Failed to process chat interaction", error);
  }
};

// Process the run and handle tool calls
const processRun = async (threadId, runId, user) => {
  try {
    const MAX_ITERATIONS = 30; // Prevent infinite loops
    const POLL_INTERVAL = 1000; // 1 second
    let iterations = 0;

    let runStatus = await waitForRunCompletion(threadId, runId);

    while (runStatus.status !== "completed" && iterations < MAX_ITERATIONS) {
      iterations++;

      if (requiresToolAction(runStatus)) {
        runStatus = await handleToolCalls(threadId, runId, runStatus, user);
        continue; // Check status immediately after submitting tool outputs
      }

      if (isFailedStatus(runStatus.status)) {
        const errorMessage = runStatus.last_error?.message || runStatus.status;
        throw new ChatError(`Run failed: ${errorMessage}`);
      }

      // Only delay if still in progress
      if (runStatus.status === "in_progress" || runStatus.status === "queued") {
        await delay(POLL_INTERVAL);
        runStatus = await waitForRunCompletion(threadId, runId);
      } else {
        break;
      }
    }

    if (iterations >= MAX_ITERATIONS) {
      throw new ChatError("Run timeout: Maximum iterations reached");
    }

    if (runStatus.status !== "completed") {
      throw new ChatError(`Run ended with status: ${runStatus.status}`);
    }

    return runStatus;
  } catch (error) {
    console.error("processRun error:", error);
    throw new ChatError("Failed to process run", error);
  }
};

// Handle tool calls
const handleToolCalls = async (threadId, runId, runStatus, user) => {
  try {
    const toolCalls =
      runStatus.required_action?.submit_tool_outputs?.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      throw new ChatError("No tool calls found in required_action");
    }

    const toolOutputs = await Promise.all(
      toolCalls.map((toolCall) => processToolCall(toolCall, user))
    );

    return await openai.beta.threads.runs.submitToolOutputs(runId, {
      thread_id: threadId,
      tool_outputs: toolOutputs,
    });
  } catch (error) {
    console.error("handleToolCalls error:", error);
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
    console.error(
      `Tool call error for ${toolCall?.function?.name}:`,
      error.message
    );
    return {
      tool_call_id: toolCall.id,
      output: JSON.stringify({
        error: error.message,
        status: "error",
      }),
    };
  }
};

// Helper functions
const formatResponse = (threadId, message) => {
  try {
    // Extract text content safely
    let content = "";
    let attachments = [];

    if (message.content && Array.isArray(message.content)) {
      // Find text content
      const textContent = message.content.find((c) => c.type === "text");
      if (textContent?.text?.value) {
        content = textContent.text.value;
      }

      // Extract file attachments if any
      const fileContents = message.content.filter(
        (c) => c.type === "image_file" || c.type === "file"
      );
      if (fileContents.length > 0) {
        attachments = fileContents.map((f) => ({
          type: f.type,
          file_id: f.image_file?.file_id || f.file?.file_id,
        }));
      }
    }

    // Fallback if no content found
    if (!content) {
      content = "No response generated";
    }

    return {
      threadId,
      message: {
        id: message.id,
        role: message.role,
        content: content,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      status: "completed",
    };
  } catch (error) {
    console.error("formatResponse error:", error);
    throw new ChatError("Failed to format response", error);
  }
};

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
    details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    status: "error",
  });
};

// Wait for run completion
const waitForRunCompletion = async (threadId, runId) => {
  try {
    return await openai.beta.threads.runs.retrieve(runId, {
      thread_id: threadId,
    });
  } catch (error) {
    console.error("waitForRunCompletion error:", error);
    throw new ChatError("Failed to retrieve run status", error);
  }
};
