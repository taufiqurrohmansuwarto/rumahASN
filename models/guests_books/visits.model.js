const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Visits extends Model {
  static get tableName() {
    return "guests_books.visits";
  }

  static get relationMappings() {
    const Guest = require("@/models/guests_books/guests.model");
    const User = require("@/models/users.model");
    const ScheduleVisit = require("@/models/guests_books/schedule-visits.model");

    return {
      guest: {
        relation: Model.BelongsToOneRelation,
        modelClass: Guest,
        join: {
          from: "guests_books.visits.guest_id",
          to: "guests_books.guests.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "guests_books.visits.user_id",
          to: "users.custom_id",
        },
      },
      schedule: {
        relation: Model.BelongsToOneRelation,
        modelClass: ScheduleVisit,
        join: {
          from: "guests_books.visits.schedule_visit_id",
          to: "guests_books.schedule_visits.id",
        },
      },
    };
  }

  $beforeInsert() {
    this.id = nanoid();
  }
}

module.exports = Visits;
