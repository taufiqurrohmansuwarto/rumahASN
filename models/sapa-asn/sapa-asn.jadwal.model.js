const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Jadwal extends Model {
  static get tableName() {
    return "sapa_asn.jadwal";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = Jadwal;
