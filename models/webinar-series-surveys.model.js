const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesSurveys extends Model {
  static get tableName() {
    return "webinar_series_surveys";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get relationMappings() {}

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesSurveys;
