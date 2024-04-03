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

  static get relationMappings() {
    const File = require("@/models/submissions-file-refs.model");

    return {
      file: {
        relation: Model.HasOneRelation,
        modelClass: File,
        join: {
          from: "submissions_files.kode_file",
          to: "submissions_file_refs.kode",
        },
      },
    };
  }
}

module.exports = SubmissionsFiles;
