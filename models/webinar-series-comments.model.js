const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesComments extends Model {
  static get tableName() {
    return "webinar_series_comments";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get relationMappings() {
    const Participant = require("@/models/users.model");

    return {
      participant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Participant,
        join: {
          from: "webinar_series_comments.user_id",
          to: "users.custom_id",
        },
      },
      children: {
        relation: Model.HasManyRelation,
        modelClass: WebinarSeriesComments,
        join: {
          from: "webinar_series_comments.id",
          to: "webinar_series_comments.webinar_series_comment_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesComments;
