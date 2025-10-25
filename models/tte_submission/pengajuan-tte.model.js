const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class PengajuanTTE extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
  }

  static get tableName() {
    return "tte_submission.pengajuan_tte";
  }
}

module.exports = PengajuanTTE;
