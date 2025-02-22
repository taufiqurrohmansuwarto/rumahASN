const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Skp extends Model {
  static get tableName() {
    return "rekon.skp";
  }
}

module.exports = Skp;
