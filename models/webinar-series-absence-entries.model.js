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

  static get relationMappings() {
    const absences = require("@/models/webinar-series-participants-absence.model");

    return {
      absences: {
        relation: Model.HasManyRelation,
        modelClass: absences,
        join: {
          from: "webinar_series_absence_entries.id",
          to: "webinar_series_participants_absence.webinar_series_absence_entry_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = WebinarSeriesAbsenceEntries;
