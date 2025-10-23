const { Model } = require("objection");
const knex = require("../../db");
const nanoid = require("nanoid");

Model.knex(knex);

class EmailPegawai extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
  }
  static get tableName() {
    return "tte_submission.email_pegawai";
  }
}

module.exports = EmailPegawai;
