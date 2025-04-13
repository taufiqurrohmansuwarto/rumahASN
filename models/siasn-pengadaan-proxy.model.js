const { Model } = require("objection");
const knex = require("../db");
const StatusUsul = require("./ref_siasn/status-usul.model");
Model.knex(knex);

class SiasnPengadaanProxy extends Model {
  static get tableName() {
    return "siasn_pengadaan_proxy";
  }

  static get relationMappings() {
    return {
      status_usulan_nama: {
        relation: Model.HasOneRelation,
        modelClass: StatusUsul,
        join: {
          from: "siasn_pengadaan_proxy.status_usulan",
          to: "ref_siasn.status_usul.id",
        },
      },
    };
  }
}

module.exports = SiasnPengadaanProxy;
