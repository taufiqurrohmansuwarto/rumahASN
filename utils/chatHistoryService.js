const BotAssistantChatThreads = require("@/models/assistant_bot/chat-threads.model");
const BotAssistantMessages = require("@/models/assistant_bot/messages.model");

const generateTitle = (message) => {
  // Ambil beberapa kata pertama dari pesan
  const words = message.split(" ").slice(0, 5).join(" ");
  return `${words}...`;
};

export const chatHistoryService = {
  // save thread
  async saveThread(threadId, userId, firstMessage) {
    try {
      const title = generateTitle(firstMessage);

      await BotAssistantChatThreads.query()
        .insert({
          id: threadId,
          user_id: userId,
          title,
          status: "active",
        })
        .onConflict("id")
        .merge();
    } catch (error) {
      console.log(error);
    }
  },

  //   save message
  async saveMessage(threadId, content, role, metadata) {
    try {
      await BotAssistantMessages.query().insert({
        thread_id: threadId,
        content,
        role,
        metadata,
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

  async getUserThreads(userId, params = {}) {
    const { limit = 10, offset = 0 } = params;
    try {
      const threads = await BotAssistantChatThreads.query()
        .where("user_id", userId)
        .limit(limit)
        .offset(offset);
      return threads;
    } catch (error) {
      console.log(error);
    }
  },
};
