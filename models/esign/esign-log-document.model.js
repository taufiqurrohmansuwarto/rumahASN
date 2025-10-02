const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class LogDocument extends Model {
  static get tableName() {
    return "esign.log_document";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("../users.model");
    const Document = require("./esign-documents.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "esign.log_document.user_id",
          to: "users.custom_id",
        },
      },
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: Document,
        join: {
          from: "esign.log_document.document_id",
          to: "esign.documents.id",
        },
      },
    };
  }
}

module.exports = LogDocument;
