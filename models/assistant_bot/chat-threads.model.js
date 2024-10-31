const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class ChatThreads extends Model {
  static get tableName() {
    return "assistant_bot.chat_threads";
  }

  static get relationMappings() {
    const AssistantBotMessages = require("./messages.model");

    return {
      messages: {
        relation: Model.HasManyRelation,
        modelClass: AssistantBotMessages,
        join: {
          from: "assistant_bot.chat_threads.id",
          to: "assistant_bot.messages.thread_id",
        },
      },
    };
  }
}

module.exports = ChatThreads;
