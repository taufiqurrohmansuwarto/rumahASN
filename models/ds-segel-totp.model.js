const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class DSSegelTOTP extends Model {
  static get tableName() {
    return "ds_segel_totp";
  }
}

module.exports = DSSegelTOTP;
