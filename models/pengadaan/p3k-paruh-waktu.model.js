const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class P3KParuhWaktu extends Model {
  static get tableName() {
    return "pengadaan.p3k_paruh_waktu";
  }

  static get relationMappings() {
    const SiasnPengadaanProxy = require("@/models/siasn-pengadaan-proxy.model");

    return {
      detail: {
        relation: Model.BelongsToOneRelation,
        modelClass: SiasnPengadaanProxy,
        join: {
          from: "pengadaan.p3k_paruh_waktu.id",
          to: "siasn_pengadaan_proxy.id",
        },
      },
    };
  }
}

module.exports = P3KParuhWaktu;
