const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesParticipates extends Model {
  static get tableName() {
    return "webinar_series_participates";
  }

  static get idColumn() {
    return ["webinar_series_id", "user_id"];
  }
}

module.exports = WebinarSeriesParticipates;
