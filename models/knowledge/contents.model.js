const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeContents extends Model {
  static get tableName() {
    return "knowledge.contents";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = knowledgeContents;
