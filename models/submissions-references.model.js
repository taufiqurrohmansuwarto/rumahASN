const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class SubmissionsReferences extends Model {
  static get tableName() {
    return "submissions_references";
  }

  static get relationMappings() {
    const User = require("./users.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "submissions_references.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = SubmissionsReferences;
