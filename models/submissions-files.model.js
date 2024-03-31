const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SubmissionsFiles extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "submissions_files";
  }
}

module.exports = SubmissionsFiles;
