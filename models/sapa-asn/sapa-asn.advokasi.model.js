const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Advokasi extends Model {
  static get tableName() {
    return "sapa_asn.advokasi";
  }

  $beforeInsert() {
    this.id = `adv-${nanoid()}`;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    const Jadwal = require("./sapa-asn.jadwal.model");
    const User = require("../users.model");

    return {
      jadwal: {
        relation: Model.BelongsToOneRelation,
        modelClass: Jadwal,
        join: {
          from: "sapa_asn.advokasi.jadwal_id",
          to: "sapa_asn.jadwal.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "sapa_asn.advokasi.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Advokasi;
