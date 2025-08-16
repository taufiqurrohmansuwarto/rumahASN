const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeCategories extends Model {
  static get tableName() {
    return "knowledge.category";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = knowledgeCategories;
