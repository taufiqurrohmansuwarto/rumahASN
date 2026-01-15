const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class FormasiUsulan extends Model {
  static get tableName() {
    return "perencanaan.formasi_usulan";
  }

  static get idColumn() {
    return "formasi_usulan_id";
  }

  $beforeInsert() {
    this.formasi_usulan_id = `fu-${nanoid()}`;
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
          from: "perencanaan.formasi_usulan.formasi_id",
          to: "perencanaan.formasi.formasi_id",
        },
      },
      usulan: {
        relation: Model.HasManyRelation,
        modelClass: Usulan,
        join: {
          from: "perencanaan.formasi_usulan.formasi_usulan_id",
          to: "perencanaan.usulan.formasi_usulan_id",
        },
      },
      pembuat: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.formasi_usulan.user_id",
          to: "users.custom_id",
        },
      },
      korektor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.formasi_usulan.corrector_id",
          to: "users.custom_id",
        },
      },
      dibuatOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.formasi_usulan.dibuat_oleh",
          to: "users.custom_id",
        },
      },
      diperbaruiOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.formasi_usulan.diperbarui_oleh",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = FormasiUsulan;
