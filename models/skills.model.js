const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Skills extends Model {
  static get tableName() {
    return "skills";
  }
}

module.exports = Skills;
