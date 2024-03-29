const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedAudits extends Model {
  static get tableName() {
    return "socmed_audits";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedAudits;
