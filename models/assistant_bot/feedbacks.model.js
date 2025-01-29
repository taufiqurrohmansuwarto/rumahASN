const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Feedbacks extends Model {
  static get tableName() {
    return "assistant_bot.feedbacks";
  }
}

module.exports = Feedbacks;
