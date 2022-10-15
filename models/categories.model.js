const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Categories extends Model {
  static get tableName() {
    return "categories";
  }

  // realation with user
  static get relationMappings() {
    const Users = require("./users.model");

    return {
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "categories.created_by",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Categories;
