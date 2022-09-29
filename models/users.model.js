const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "custom_id";
  }

  static get relationMappings() {
    const Role = require("./roles.model");
    return {
      current_role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: "users.current_role",
          to: "roles.name",
        },
      },
    };
  }
}

module.exports = User;
