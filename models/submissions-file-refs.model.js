const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SubmissionsFileRefsModel extends Model {
  static get idColumn() {
    return "kode";
  }

  static get tableName() {
    return "submissions_file_refs";
  }
}

module.exports = SubmissionsFileRefsModel;
