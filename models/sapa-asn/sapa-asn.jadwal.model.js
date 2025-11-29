const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Jadwal extends Model {
  static get tableName() {
    return "sapa_asn.jadwal";
  }

  $beforeInsert() {
    this.id = `jdw-${nanoid()}`;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    const Advokasi = require("./sapa-asn.advokasi.model");

    return {
      advokasi_list: {
        relation: Model.HasManyRelation,
        modelClass: Advokasi,
        join: {
          from: "sapa_asn.jadwal.id",
          to: "sapa_asn.advokasi.jadwal_id",
        },
      },
    };
  }
}

module.exports = Jadwal;
