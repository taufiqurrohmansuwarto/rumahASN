const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class OperatorGajiPW extends Model {
  static get tableName() {
    return "pengadaan.operator_gaji_pw";
  }
}

module.exports = OperatorGajiPW;
