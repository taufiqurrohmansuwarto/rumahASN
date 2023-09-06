const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesRatings extends Model {
  static get tableName() {
    return "webinar_series_ratings";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      participant: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "webinar_series_ratings.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesRatings;
