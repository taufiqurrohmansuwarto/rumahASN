const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Formasi extends Model {
  static get tableName() {
    return "perencanaan.formasi";
  }

  static get idColumn() {
    return "formasi_id";
  }

  $beforeInsert() {
    this.formasi_id = `form-${nanoid()}`;
    this.dibuat_pada = new Date().toISOString();
    this.diperbarui_pada = new Date().toISOString();
  }

  $beforeUpdate() {
    this.diperbarui_pada = new Date().toISOString();
  }

  static get relationMappings() {
    const User = require("../users.model");
    const FormasiUsulan = require("./perencanaan.formasi_usulan.model");

    return {
      dibuatOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.formasi.dibuat_oleh",
          to: "users.custom_id",
        },
      },
      diperbaruiOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.formasi.diperbarui_oleh",
          to: "users.custom_id",
        },
      },
      formasiUsulan: {
        relation: Model.HasManyRelation,
        modelClass: FormasiUsulan,
        join: {
          from: "perencanaan.formasi.formasi_id",
          to: "perencanaan.formasi_usulan.formasi_id",
        },
      },
    };
  }
}

module.exports = Formasi;