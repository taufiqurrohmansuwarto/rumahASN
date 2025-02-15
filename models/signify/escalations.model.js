const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Escalations extends Model {
  static get tableName() {
    return "signify.escalations";
  }
}

module.exports = Escalations;
