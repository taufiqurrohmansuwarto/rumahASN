const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class SignatureDetails extends Model {
  static get tableName() {
    return "esign.signature_details";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {}
}

module.exports = SignatureDetails;
