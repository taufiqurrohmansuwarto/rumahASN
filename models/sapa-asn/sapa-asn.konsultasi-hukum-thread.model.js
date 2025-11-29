const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class KonsultasiHukumThread extends Model {
  static get tableName() {
    return "sapa_asn.konsultasi_hukum_thread";
  }

  $beforeInsert() {
    this.id = `kht-${nanoid()}`;
    this.created_at = new Date().toISOString();
  }

  static get relationMappings() {
    const KonsultasiHukum = require("./sapa-asn.konsultasi-hukum.model");
    const User = require("../users.model");

    return {
      konsultasi: {
        relation: Model.BelongsToOneRelation,
        modelClass: KonsultasiHukum,
        join: {
          from: "sapa_asn.konsultasi_hukum_thread.konsultasi_hukum_id",
          to: "sapa_asn.konsultasi_hukum.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "sapa_asn.konsultasi_hukum_thread.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = KonsultasiHukumThread;
