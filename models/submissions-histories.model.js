const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SubmissionHistories extends Model {
  static get tableName() {
    return "submission_histories";
  }

  static get relationMappings() {}

  static get idColumn() {
    return "id";
  }
}

module.exports = SubmissionHistories;
