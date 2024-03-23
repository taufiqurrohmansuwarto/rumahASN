const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class SubmissionsPIC extends Model {
  static get tableName() {
    return "submissions_pics";
  }

  static get relationMappings() {
    const User = require("./users.model");
    return {};
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = SubmissionsPIC;
