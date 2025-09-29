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

  static get relationMappings() {
    const Users = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "esign.signature_details.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = SignatureDetails;
