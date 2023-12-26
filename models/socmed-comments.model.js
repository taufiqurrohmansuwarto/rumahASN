const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedComments extends Model {
  static get tableName() {
    return "socmed_comments";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedComments;
