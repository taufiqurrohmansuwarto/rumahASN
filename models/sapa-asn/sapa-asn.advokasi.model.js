const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Advokasi extends Model {
  static get tableName() {
    return "sapa_asn.advokasi";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = Advokasi;
