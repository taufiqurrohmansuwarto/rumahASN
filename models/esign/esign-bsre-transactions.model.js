const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class BsreTransactions extends Model {
  static get tableName() {
    return "esign.bsre_transactions";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const SignatureDetails = require("@/models/esign/esign-signature-details.model");
    const Documents = require("@/models/esign/esign-documents.model");

    return {
      signature_detail: {
        relation: Model.BelongsToOneRelation,
        modelClass: SignatureDetails,
        join: {
          from: "esign.bsre_transactions.signature_detail_id",
          to: "esign.signature_details.id",
        },
      },
    };
  }
}

module.exports = BsreTransactions;
