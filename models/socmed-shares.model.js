const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedShares extends Model {
  static get tableName() {
    return "socmed_shares";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedShares;
