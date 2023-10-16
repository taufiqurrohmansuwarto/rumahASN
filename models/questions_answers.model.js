const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class QuestionsAnswers extends Model {
  static get tableName() {
    return "questions_answers";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = QuestionsAnswers;
