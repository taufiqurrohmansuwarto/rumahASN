const { Model, raw } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SubCategories extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sub_categories";
  }

  static get modifiers() {
    return {
      custom(builder) {
        builder.select("*", raw("EXTRACT (EPOCH FROM durasi/60) as durasi"));
      },
    };
  }

  static get relationMappings() {
    const Categories = require("./categories.model");
    const Users = require("./users.model");

    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Categories,
        join: {
          from: "sub_categories.category_id",
          to: "categories.id",
        },
      },
      created_by: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "sub_categories.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = SubCategories;
