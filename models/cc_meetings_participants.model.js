const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class CCMeetingsParticipants extends Model {
  static get tableName() {
    return "cc_meetings_participants";
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = CCMeetingsParticipants;
