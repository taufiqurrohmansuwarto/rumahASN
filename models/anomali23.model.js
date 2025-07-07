const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Anomali23 extends Model {
  static get tableName() {
    return "anomali_23";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const PegawaiSimaster = require("@/models/sync-pegawai.model");
    const PegawaiSiasn = require("@/models/siasn-employees.model");

    return {
      pegawai_simaster: {
        relation: Model.BelongsToOneRelation,
        modelClass: PegawaiSimaster,
        join: {
          from: "anomali_23.nip_baru",
          to: "sync_pegawai.nip_master",
        },
      },
      pegawai_siasn: {
        relation: Model.BelongsToOneRelation,
        modelClass: PegawaiSiasn,
        join: {
          from: "anomali_23.nip_baru",
          to: "siasn_employees.nip_baru",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "anomali_23.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Anomali23;
