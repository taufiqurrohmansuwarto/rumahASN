const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DGroups extends Model {
  static get tableName() {
    return "d_groups";
  }
}

module.exports = DGroups;
