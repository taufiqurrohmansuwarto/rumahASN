const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Status extends Model {
  static get idColumn() {
    return "name";
  }

  static get tableName() {
    return "status";
  }
}

module.exports = Status;
