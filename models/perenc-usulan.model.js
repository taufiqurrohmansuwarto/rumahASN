const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class PerencUsulan extends Model {
  static get tableName() {
    return "perenc_usulan";
  }
}

module.exports = PerencUsulan;
