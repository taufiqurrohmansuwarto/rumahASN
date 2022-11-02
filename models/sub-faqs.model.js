const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Subfaqs extends Model {
  static get tableName() {
    return "sub_faqs";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Subfaqs;
