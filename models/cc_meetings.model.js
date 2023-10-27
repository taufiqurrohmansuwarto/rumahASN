const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class CCMeetings extends Model {
  static get tableName() {
    return "cc_meetings";
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = CCMeetings;
