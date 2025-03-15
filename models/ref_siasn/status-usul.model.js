const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class StatusUsul extends Model {
  static get tableName() {
    return "ref_siasn.status_usul";
  }
}

module.exports = StatusUsul;
