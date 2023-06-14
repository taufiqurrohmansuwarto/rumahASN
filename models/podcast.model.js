const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Podcast extends Model {
  static get tableName() {
    return "podcast";
  }
}

export default Podcast;
