const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class RiwayatAudit extends Model {
  static get tableName() {
    return "perencanaan.riwayat_audit";
  }

  static get idColumn() {
    return "riwayat_audit_id";
  }

  $beforeInsert() {
    this.riwayat_audit_id = `audit-${nanoid()}`;
    this.dibuat_pada = new Date().toISOString();
    this.diperbarui_pada = new Date().toISOString();
  }

  $beforeUpdate() {
    this.diperbarui_pada = new Date().toISOString();
  }

  static get relationMappings() {
    const User = require("../users.model");
    const Formasi = require("./perencanaan.formasi.model");
    const Usulan = require("./perencanaan.usulan.model");

    return {
      formasi: {
        relation: Model.BelongsToOneRelation,
        modelClass: Formasi,
        join: {
          from: "perencanaan.riwayat_audit.formasi_id",
          to: "perencanaan.formasi.formasi_id",
        },
      },
      usulan: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usulan,
        join: {
          from: "perencanaan.riwayat_audit.usulan_id",
          to: "perencanaan.usulan.usulan_id",
        },
      },
      dibuatOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.riwayat_audit.dibuat_oleh",
          to: "users.custom_id",
        },
      },
      diperbaruiOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.riwayat_audit.diperbarui_oleh",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = RiwayatAudit;

