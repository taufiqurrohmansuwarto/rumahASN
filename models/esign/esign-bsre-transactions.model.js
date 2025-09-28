const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");
const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const Documents = require("@/models/esign/esign-documents.model");

Model.knex(knex);

class BsreTransactions extends Model {
  static get tableName() {
    return "esign.bsre_transactions";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = BsreTransactions;
