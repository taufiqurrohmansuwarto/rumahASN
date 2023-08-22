const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class PollsVotes extends Model {
  static get tableName() {
    return "polls_votes";
  }

  static get idColumn() {
    return ["poll_id", "user_id"];
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = PollsVotes;
