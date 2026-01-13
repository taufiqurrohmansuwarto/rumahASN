const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Usulan extends Model {
  static get tableName() {
    return "perencanaan.usulan";
  }

  static get idColumn() {
    return "usulan_id";
  }

  // Define JSON columns for proper serialization
  static get jsonAttributes() {
    return ["kualifikasi_pendidikan"];
  }

  $beforeInsert() {
    this.usulan_id = `usul-${nanoid()}`;
    this.dibuat_pada = new Date().toISOString();
    this.diperbarui_pada = new Date().toISOString();
  }

  $beforeUpdate() {
    this.diperbarui_pada = new Date().toISOString();
  }

  static get relationMappings() {
    const User = require("../users.model");
    const Formasi = require("./perencanaan.formasi.model");
    const Lampiran = require("./perencanaan.lampiran.model");

    return {
      formasi: {
        relation: Model.BelongsToOneRelation,
        modelClass: Formasi,
        join: {
          from: "perencanaan.usulan.formasi_id",
          to: "perencanaan.formasi.formasi_id",
        },
      },
      lampiran: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lampiran,
        join: {
          from: "perencanaan.usulan.lampiran_id",
          to: "perencanaan.lampiran.lampiran_id",
        },
      },
      dibuatOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.usulan.dibuat_oleh",
          to: "users.custom_id",
        },
      },
      diperbaruiOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.usulan.diperbarui_oleh",
          to: "users.custom_id",
        },
      },
      diverifikasiOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.usulan.diverifikasi_oleh",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Usulan;

