const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DPosts extends Model {
  static get tableName() {
    return "d_posts";
  }
}

module.exports = DPosts;
