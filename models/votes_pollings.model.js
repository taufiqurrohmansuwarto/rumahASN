const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class VotesPollings extends Model {
  static get tableName() {
    return "votes_pollings";
  }
}

export default VotesPollings;
