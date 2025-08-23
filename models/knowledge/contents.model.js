const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeContents extends Model {
  static get tableName() {
    return "knowledge.contents";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Category = require("@/models/knowledge/categories.model");

    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.contents.author_id",
          to: "users.custom_id",
        },
      },
      user_verified: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.contents.verified_by",
          to: "users.custom_id",
        },
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: "knowledge.contents.category_id",
          to: "knowledge.category.id",
        },
      },
    };
  }
}

module.exports = knowledgeContents;
