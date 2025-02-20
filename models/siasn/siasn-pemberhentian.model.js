const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class SiasnPemberhentian extends Model {
  static get tableName() {
    return "siasn_pemberhentian";
  }
}

module.exports = SiasnPemberhentian;
