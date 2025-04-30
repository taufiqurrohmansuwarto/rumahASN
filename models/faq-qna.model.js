const { Model } = require("objection");
const knex = require("../db");
// nanoid

Model.knex(knex);

class FaqQna extends Model {
  static get tableName() {
    return "faq_qna";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {}
}

module.exports = FaqQna;
