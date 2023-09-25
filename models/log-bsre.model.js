const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class LogBsre extends Model {
  static get tableName() {
    return "log_bsre";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const WebinarSeriesParticipants = require("@/models/webinar-series-participates.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "log_bsre.user_id",
          to: "users.custom_id",
        },
      },
      webinar_series_participates: {
        relation: Model.BelongsToOneRelation,
        modelClass: WebinarSeriesParticipants,
        join: {
          from: "log_bsre.webinar_series_participate_id",
          to: "webinar_series_participates.id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = LogBsre;
