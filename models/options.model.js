const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Options extends Model {
  static get tableName() {
    return "options";
  }
}

export default Options;
