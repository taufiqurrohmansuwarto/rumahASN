const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesPostests extends Model {
  static get tableName() {
    return "webinar_series_postests";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get modifiers() {}

  static get relationMappings() {}

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesPostests;
