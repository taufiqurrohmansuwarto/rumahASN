const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Submissions extends Model {
  static get tableName() {
    return "submissions";
  }

  static get relationMappings() {}

  $beforeInsert() {
    this.id = nanoid(12);
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Submissions;
