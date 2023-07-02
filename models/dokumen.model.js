const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Dokumen extends Model {
  static get tableName() {
    return "dokumen";
  }
}

module.exports = Dokumen;
