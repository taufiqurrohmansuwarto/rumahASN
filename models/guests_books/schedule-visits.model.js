const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");
const Guest = require("@/models/guests_books/guests.model");
const Visits = require("@/models/guests_books/visits.model");
const QrCode = require("@/models/guests_books/qr-code.model");

Model.knex(knex);

class ScheduleVisits extends Model {
  static get tableName() {
    return "guests_books.schedule_visits";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {
      guest: {
        relation: Model.HasOneRelation,
        modelClass: Guest,
        join: {
          from: "guests_books.schedule_visits.guest_id",
          to: "guests_books.guests.id",
        },
      },
      visits: {
        relation: Model.HasManyRelation,
        modelClass: Visits,
        join: {
          from: "guests_books.schedule_visits.id",
          to: "guests_books.visits.schedule_visit_id",
        },
      },
      qrCode: {
        relation: Model.HasOneRelation,
        modelClass: QrCode,
        join: {
          from: "guests_books.schedule_visits.id",
          to: "guests_books.qr_code.schedule_visit_id",
        },
      },
    };
  }
}

module.exports = ScheduleVisits;
