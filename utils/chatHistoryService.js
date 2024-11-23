import { toLower } from "lodash";

const BotAssistantChatThreads = require("@/models/assistant_bot/chat-threads.model");
const BotAssistantMessages = require("@/models/assistant_bot/messages.model");

const generateTitle = (message) => {
  // Ambil beberapa kata pertama dari pesan
  const words = message.split(" ").slice(0, 5).join(" ");
  return `${words}...`;
};

export const chatHistoryService = {
  // save thread
  async saveThread(threadId, userId, firstMessage, assistantId) {
    try {
      const title = generateTitle(firstMessage);

      await BotAssistantChatThreads.query()
        .insert({
          id: threadId,
          user_id: userId,
          title,
          status: "active",
          assistant_id: assistantId,
        })
        .onConflict("id")
        .merge();
    } catch (error) {
      console.log(error);
    }
  },

  //   save message
  async saveMessage(threadId, content, role, metadata, userId) {
    try {
      await BotAssistantMessages.query().insert({
        thread_id: threadId,
        content,
        role,
        metadata,
        user_id: userId,
      });
    } catch (error) {
      console.log(error);
    }
  },

  //   get thread
  async getThread(threadId) {
    try {
      const thread = await BotAssistantChatThreads.query().findById(threadId);
      return thread;
    } catch (error) {
      console.log(error);
    }
  },

  async getUserThreads(userId, assistantId) {
    try {
      const threads = await BotAssistantChatThreads.query()
        .where("user_id", userId)
        .andWhere("assistant_id", assistantId)
        .orderBy("created_at", "desc");
      return threads;
    } catch (error) {
      console.log(error);
    }
  },

  async deleteThreadMessages(payload) {
    try {
      await BotAssistantChatThreads.query()
        .where("user_id", payload?.userId)
        .andWhere("id", payload?.threadId)
        .delete();
      await BotAssistantMessages.query()
        .where("user_id", payload?.userId)
        .andWhere("thread_id", payload?.threadId)
        .delete();
    } catch (error) {
      console.log(error);
    }
  },

  async getThreadMessages(userId, threadId) {
    try {
      const messages = await BotAssistantMessages.query()
        .where("user_id", userId)
        .andWhere("thread_id", threadId)
        .orderBy("created_at", "asc")
        .withGraphFetched("user");

      const result = messages.map((item) => ({
        ...item,
        key: item.id,
        role: toLower(item.role) === "user" ? "user" : "ai",
        loading: false,
      }));

      return result;
    } catch (error) {
      console.log(error);
    }
  },
};
