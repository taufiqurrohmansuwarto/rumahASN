const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class BezJfJenjang extends Model {
  static get tableName() {
    return "bez_jf_jenjang";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = BezJfJenjang;
