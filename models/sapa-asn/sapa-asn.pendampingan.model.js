const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Pendampingan extends Model {
  static get tableName() {
    return "sapa_asn.pendampingan";
  }

  $beforeInsert() {
    this.id = `ph-${nanoid()}`;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    const User = require("../users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "sapa_asn.pendampingan.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Pendampingan;
