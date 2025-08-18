const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeXpLog extends Model {
  static get tableName() {
    return "knowledge.xp_log";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = knowledgeXpLog;
