// services/openaiService.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createThread = async () => {
  try {
    return await openai.beta.threads.create({});
  } catch (error) {
    throw new ChatError("Failed to create thread", error);
  }
};

export const createMessage = async (threadId, content) => {
  try {
    return await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });
  } catch (error) {
    throw new ChatError("Failed to create message", error);
  }
};

export const createRun = async (threadId, assistantId) => {
  try {
    return await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
  } catch (error) {
    throw new ChatError("Failed to create run", error);
  }
};

export const getMessages = async (threadId) => {
  try {
    return await openai.beta.threads.messages.list(threadId);
  } catch (error) {
    throw new ChatError("Failed to get messages", error);
  }
};
