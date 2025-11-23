const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KonsultasiHukum extends Model {
  static get tableName() {
    return "sapa_asn.konsultasi_hukum";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = KonsultasiHukum;
