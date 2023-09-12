const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class WebinarSeriesAbsenceEntries extends Model {
  static get tableName() {
    return "webinar_series_absence_entries";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }

  static get relationMappings() {}

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesAbsenceEntries;
