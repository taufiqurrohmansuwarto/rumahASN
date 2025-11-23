const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Pendampingan extends Model {
  static get tableName() {
    return "sapa_asn.pendampingan";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = Pendampingan;
