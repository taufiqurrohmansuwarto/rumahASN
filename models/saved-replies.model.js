const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SavedReplies extends Model {
  static get tableName() {
    return "saved_replies";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = SavedReplies;
