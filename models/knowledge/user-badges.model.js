const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeUserBadges extends Model {
  static get tableName() {
    return "knowledge.user_badges";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = knowledgeUserBadges;
