const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesParticipates extends Model {
  static get tableName() {
    return "webinar_series_participates";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const WebinarSeries = require("@/models/webinar-series.model");
    const User = require("@/models/users.model");

    return {
      webinar_series: {
        relation: Model.BelongsToOneRelation,
        modelClass: WebinarSeries,
        join: {
          from: "webinar_series_participates.webinar_series_id",
          to: "webinar_series.id",
        },
      },
      participant: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "webinar_series_participates.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = WebinarSeriesParticipates;
