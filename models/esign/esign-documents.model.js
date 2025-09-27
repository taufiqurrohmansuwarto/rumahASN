const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");
const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const BsreTransactions = require("@/models/esign/esign-bsre-transactions.model");

Model.knex(knex);

class Documents extends Model {
  static get tableName() {
    return "esign.documents";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {
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
