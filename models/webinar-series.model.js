const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeries extends Model {
  static get tableName() {
    return "webinar_series";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get relationMappings() {
    const WebinarParticipate = require("@/models/webinar-series-participates.model");
    return {
      participates: {
        relation: Model.HasManyRelation,
        modelClass: WebinarParticipate,
        join: {
          from: "webinar_series.id",
          to: "webinar_series_participates.webinar_series_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeries;
