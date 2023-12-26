const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedLikes extends Model {
  static get tableName() {
    return "socmed_likes";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedLikes;
