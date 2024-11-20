const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class AssistantBotMesssages extends Model {
  static get tableName() {
    return "assistant_bot.messages";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const ChatThreads = require("./chat-threads.model");
    const Users = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "assistant_bot.messages.user_id",
          to: "users.custom_id",
        },
      },
      thread: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChatThreads,
        join: {
          from: "assistant_bot.messages.thread_id",
          to: "assistant_bot.chat_threads.id",
        },
      },
    };
  }
}

module.exports = AssistantBotMesssages;
