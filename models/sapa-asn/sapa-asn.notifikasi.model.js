const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Notifikasi extends Model {
  static get tableName() {
    return "sapa_asn.notifikasi";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = Notifikasi;
