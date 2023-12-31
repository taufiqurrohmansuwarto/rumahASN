const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DBookmarks extends Model {
  static get tableName() {
    return "d_bookmarks";
  }
}

module.exports = DBookmarks;
