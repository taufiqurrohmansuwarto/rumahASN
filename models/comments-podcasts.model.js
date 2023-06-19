const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class CommentPodcast extends Model {
  static get tableName() {
    return "comments_podcasts";
  }
}

module.exports = CommentPodcast;
