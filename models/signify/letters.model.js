const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Letters extends Model {
  static get tableName() {
    return "signify.letters";
  }
}

module.exports = Letters;
