const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Polls extends Model {
  static get tableName() {
    return "polls";
  }

  // realation with user
  static get relationMappings() {}
}

export default Polls;
