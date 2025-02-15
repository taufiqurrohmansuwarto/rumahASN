const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class LetterWorkflow extends Model {
  static get tableName() {
    return "signify.letter_workflow";
  }
}

module.exports = LetterWorkflow;
