const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class RefSIASNUnor extends Model {
  static get tableName() {
    return "ref_siasn_unor";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = RefSIASNUnor;
