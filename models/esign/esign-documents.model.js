const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Documents extends Model {
  static get tableName() {
    return "esign.documents";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const SignatureDetails = require("@/models/esign/esign-signature-details.model");
    const BsreTransactions = require("@/models/esign/esign-bsre-transactions.model");
    const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "esign.documents.created_by",
          to: "users.custom_id",
        },
      },
      signature_requests: {
        relation: Model.HasManyRelation,
        modelClass: SignatureRequests,
        join: {
          from: "esign.documents.id",
          to: "esign.signature_requests.document_id",
        },
      },
      signature_detail: {
        relation: Model.BelongsToOneRelation,
        modelClass: SignatureDetails,
        join: {
          from: "esign.documents.signature_detail_id",
          to: "esign.bsre_transactions.id",
        },
      },
      bsre_transaction: {
        relation: Model.BelongsToOneRelation,
        modelClass: BsreTransactions,
        join: {
          from: "esign.documents.document_id",
          to: "esign.bsre_transactions.id",
        },
      },
    };
  }
}

module.exports = Documents;
