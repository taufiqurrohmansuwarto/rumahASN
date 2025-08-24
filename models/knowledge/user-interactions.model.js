const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KnowledgeUserInteractions extends Model {
  static get tableName() {
    return "knowledge.user_interactions";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get modifiers() {
    return {
      isLiked(query, custom_id, content_id) {
        query
          .where("user_id", custom_id)
          .where("type", "like")
          .where("content_id", content_id)
          .first();
      },
      isBookmarked(query, custom_id, content_id) {
        query
          .where("user_id", custom_id)
          .where("type", "bookmark")
          .where("content_id", content_id)
          .first();
      },
    };
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.user_interactions.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = KnowledgeUserInteractions;
