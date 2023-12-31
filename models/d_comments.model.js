const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DComments extends Model {
  static get tableName() {
    return "d_comments";
  }
}

module.exports = DComments;
