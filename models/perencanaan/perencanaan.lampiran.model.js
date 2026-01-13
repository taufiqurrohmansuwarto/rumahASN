const { Model } = require("objection");
const knex = require("../../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

class Lampiran extends Model {
  static get tableName() {
    return "perencanaan.lampiran";
  }

  static get idColumn() {
    return "lampiran_id";
  }

  $beforeInsert() {
    this.lampiran_id = `lamp-${nanoid()}`;
    this.dibuat_pada = new Date().toISOString();
    this.diperbarui_pada = new Date().toISOString();
  }

  $beforeUpdate() {
    this.diperbarui_pada = new Date().toISOString();
  }

  static get relationMappings() {
    const User = require("../users.model");
    const Usulan = require("./perencanaan.usulan.model");

    return {
      usulan: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usulan,
        join: {
          from: "perencanaan.lampiran.usulan_id",
          to: "perencanaan.usulan.usulan_id",
        },
      },
      dibuatOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.lampiran.dibuat_oleh",
          to: "users.custom_id",
        },
      },
      diperbaruiOleh: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perencanaan.lampiran.diperbarui_oleh",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Lampiran;

