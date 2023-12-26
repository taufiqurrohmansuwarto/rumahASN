const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedPosts extends Model {
  static get tableName() {
    return "socmed_posts";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedPosts;
