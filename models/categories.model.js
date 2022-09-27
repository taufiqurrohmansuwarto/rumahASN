const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Categories extends Model {
  static get tableName() {
    return "categories";
  }
}

module.exports = Categories;
