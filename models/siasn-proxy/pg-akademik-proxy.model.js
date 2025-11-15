const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class PgAkademikProxy extends Model {
  static get tableName() {
    return "siasn_proxy.proxy_pg_akademik";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const Pegawai = require("@/models/sync-pegawai.model");

    return {
      pegawai: {
        relation: Model.BelongsToOneRelation,
        modelClass: Pegawai,
        join: {
          from: "siasn_proxy.proxy_pg_akademik.nip",
          to: "sync_pegawai.nip_master",
        },
      },
    };
  }
}

module.exports = PgAkademikProxy;

