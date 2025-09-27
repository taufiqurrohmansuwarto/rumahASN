const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class SignatureRequests extends Model {
  static get tableName() {
    return "esign.signature_requests";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {}
}

module.exports = SignatureRequests;
