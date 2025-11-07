const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class AuditLog extends Model {
  static get tableName() {
    return "pengadaan.audit_log";
  }

  static get relationMappings() {
    const SiasnPengadaanProxy = require("@/models/siasn-pengadaan-proxy.model");
    const P3KParuhWaktu = require("@/models/pengadaan/p3k-paruh-waktu.model");
    const User = require("@/models/users.model");

    return {
      detail: {
        relation: Model.BelongsToOneRelation,
        modelClass: P3KParuhWaktu,
        join: {
          from: "pengadaan.audit_log.record_id",
          to: "pengadaan.p3k_paruh_waktu.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "pengadaan.audit_log.change_by",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = AuditLog;
