const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class BezJf extends Model {
  static get tableName() {
    return "bez_jf";
  }

  static get idColumn() {
    return "kode";
  }
}

module.exports = BezJf;
