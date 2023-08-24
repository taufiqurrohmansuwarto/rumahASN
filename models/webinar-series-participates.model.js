const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class WebinarSeriesParticipates extends Model {
  static get tableName() {
    return "webinar_series_participates";
  }

  static get idColumn() {
    return ["webinar_series_id", "user_id"];
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
      participation: {
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
