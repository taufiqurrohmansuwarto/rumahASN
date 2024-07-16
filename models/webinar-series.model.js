const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
const User = require("./users.model");
Model.knex(knex);

class WebinarSeries extends Model {
  static get tableName() {
    return "webinar_series";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get modifiers() {
    return {
      selectName(builder) {
        builder.select("id", "title");
      },
    };
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
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "webinar_series.created_by",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeries;
