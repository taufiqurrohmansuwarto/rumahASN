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

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeries;
