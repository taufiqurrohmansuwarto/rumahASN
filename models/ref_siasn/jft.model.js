const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Jft extends Model {
  static get tableName() {
    return "ref_siasn.jft";
  }
}

module.exports = Jft;
