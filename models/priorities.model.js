const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Priorities extends Model {
  static get tableName() {
    return "priorities";
  }

  static get idColumn() {
    return "name";
  }

  // relation with user
  static get relationMappings() {
    const Users = require("./users.model");

    return {
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "priorities.created_by",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Priorities;
