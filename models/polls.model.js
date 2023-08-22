const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Polls extends Model {
  static get tableName() {
    return "polls";
  }

  // realation with user
  static get relationMappings() {
    const author = require("@/models/users.model");
    const answers = require("@/models/polls-answers.model");

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: author,
        join: {
          from: "polls.author",
          to: "users.custom_id",
        },
      },
      answers: {
        relation: Model.HasManyRelation,
        modelClass: answers,
        join: {
          from: "polls.id",
          to: "polls_answers.poll_id",
        },
      },
    };
  }
}

module.exports = Polls;
