const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class PollsAnswers extends Model {
  static get tableName() {
    return "polls_answers";
  }

  static get idColumn() {
    return "id";
  }

  static get modifiers() {
    return {
      simpleSelect(query) {
        query.relatedQuery("votes").count().as("votes_count");
      },
    };
  }

  // realation with user
  static get relationMappings() {
    const Vote = require("@/models/polls-votes.model");

    return {
      votes: {
        relation: Model.HasManyRelation,
        modelClass: Vote,
        join: {
          from: "polls_answers.id",
          to: "polls_votes.answer_id",
        },
      },
    };
  }
}

module.exports = PollsAnswers;
