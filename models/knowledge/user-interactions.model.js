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
