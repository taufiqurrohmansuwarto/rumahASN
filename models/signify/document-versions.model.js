const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class DocumentVersions extends Model {
  static get tableName() {
    return "signify.document_versions";
  }
}

module.exports = DocumentVersions;
