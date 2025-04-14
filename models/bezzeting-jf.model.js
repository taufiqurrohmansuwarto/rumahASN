const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class BezzetingJf extends Model {
  static get tableName() {
    return "bezzeting_jf";
  }
}

module.exports = BezzetingJf;
