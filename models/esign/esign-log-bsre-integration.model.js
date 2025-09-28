const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");
const Documents = require("@/models/esign/esign-documents.model");
const BsreTransactions = require("@/models/esign/esign-bsre-transactions.model");

Model.knex(knex);

class LogBsreIntegration extends Model {
  static get tableName() {
    return "esign.log_bsre_integration";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {}
}

module.exports = LogBsreIntegration;
