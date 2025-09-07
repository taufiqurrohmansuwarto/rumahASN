const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeNotifications extends Model {
  static get tableName() {
    return "knowledge.notifications";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Content = require("@/models/knowledge/contents.model");
    const UserInteraction = require("@/models/knowledge/user_interactions.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.notifications.user_id",
          to: "users.custom_id",
        },
      },
      content: {
        relation: Model.BelongsToOneRelation,
        modelClass: Content,
        join: {
          from: "knowledge.notifications.content_id",
          to: "knowledge.contents.id",
        },
      },
      userInteraction: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserInteraction,
        join: {
          from: "knowledge.notifications.comment_id",
          to: "knowledge.user_interactions.id",
        },
      },
      actor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.notifications.actor_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = knowledgeNotifications;
