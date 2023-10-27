const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class CCMeetings extends Model {
  $beforeInsert() {
    this.id = nanoid();
  }

  static get tableName() {
    return "cc_meetings";
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = CCMeetings;
