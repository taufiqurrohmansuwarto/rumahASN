const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DVotes extends Model {
  static get tableName() {
    return "d_votes";
  }
}

module.exports = DVotes;
