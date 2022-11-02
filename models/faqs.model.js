const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Faqs extends Model {
  static get tableName() {
    return "faqs";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Faqs;
