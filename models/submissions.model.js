const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Submissions extends Model {
  static get tableName() {
    return "submissions";
  }

  static get relationMappings() {
    const SubmissionReference = require("@/models/submissions-references.model");
    return {
      reference: {
        relation: Model.HasOneRelation,
        modelClass: SubmissionReference,
        join: {
          from: "submissions.submission_reference_id",
          to: "submissions_references.id",
        },
      },
    };
  }

  $beforeInsert() {
    this.id = nanoid(12);
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Submissions;
