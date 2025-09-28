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

  static get relationMappings() {
    const SignatureDetails = require("@/models/esign/esign-signature-details.model");
    return {
      signature_details: {
        relation: Model.HasManyRelation,
        modelClass: SignatureDetails,
        join: {
          from: "esign.signature_requests.id",
          to: "esign.signature_details.request_id",
        },
      },
    };
  }
}

module.exports = SignatureRequests;
