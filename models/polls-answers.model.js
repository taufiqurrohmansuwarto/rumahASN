const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class PollsAnswers extends Model {
  static get tableName() {
    return "polls_answers";
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = PollsAnswers;
