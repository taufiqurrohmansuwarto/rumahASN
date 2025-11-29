const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Notifikasi extends Model {
  static get tableName() {
    return "sapa_asn.notifikasi";
  }

  $beforeInsert() {
    this.id = `ntf-${nanoid()}`;
    this.created_at = new Date().toISOString();
  }

  static get relationMappings() {
    const User = require("../users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "sapa_asn.notifikasi.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Notifikasi;
