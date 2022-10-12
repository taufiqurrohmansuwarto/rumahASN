const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Status extends Model {
  // insert id with default uuid
  $beforeInsert() {
    this.id = uuidv4();
  }

  static get tableName() {
    return "status";
  }
}

module.exports = Status;
