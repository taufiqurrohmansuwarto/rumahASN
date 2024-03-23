const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SubmissionsReferences extends Model {
  static get tableName() {
    return "submissions_references";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = SubmissionsReferences;
