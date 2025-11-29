const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class KonsultasiHukum extends Model {
  static get tableName() {
    return "sapa_asn.konsultasi_hukum";
  }

  $beforeInsert() {
    this.id = `kh-${nanoid()}`;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    const KonsultasiHukumThread = require("./sapa-asn.konsultasi-hukum-thread.model");
    const User = require("../users.model");

    return {
      threads: {
        relation: Model.HasManyRelation,
        modelClass: KonsultasiHukumThread,
        join: {
          from: "sapa_asn.konsultasi_hukum.id",
          to: "sapa_asn.konsultasi_hukum_thread.konsultasi_hukum_id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "sapa_asn.konsultasi_hukum.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = KonsultasiHukum;
