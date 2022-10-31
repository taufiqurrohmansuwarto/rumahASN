const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SubCategories extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sub_categories";
  }
}

module.exports = SubCategories;
