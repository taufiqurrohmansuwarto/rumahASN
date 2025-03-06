const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnIPASN extends Model {
  static get tableName() {
    return "siasn_ipasn";
  }

  static get modifiers() {
    return {
      simple(query) {
        query.select(
          "kualifikasi",
          "kompetensi",
          "kinerja",
          "disiplin",
          "total",
          "updated"
        );
      },
    };
  }
}

module.exports = SiasnIPASN;
