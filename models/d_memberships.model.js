const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DMemberships extends Model {
  static get tableName() {
    return "d_memberships";
  }
}

module.exports = DMemberships;
