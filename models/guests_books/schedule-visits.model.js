const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class ScheduleVisits extends Model {
  static get tableName() {
    return "guests_books.schedule_visits";
  }

  $beforeInsert() {
    this.id = nanoid();
  }
}

module.exports = ScheduleVisits;
