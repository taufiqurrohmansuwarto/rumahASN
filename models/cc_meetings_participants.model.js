const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class CCMeetingsParticipants extends Model {
  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.id = nanoid(10);
  }

  static get tableName() {
    return "cc_meetings_participants";
  }

  static get modifiers() {
    return {
      allSelect(query) {
        query.orderBy("created_at", "desc");
      },
    };
  }

  // realation with user
  static get relationMappings() {
    const meeting = require("@/models/cc_meetings.model");
    const participants = require("@/models/users.model");
    return {
      participant: {
        relation: Model.BelongsToOneRelation,
        modelClass: participants,
        join: {
          from: "cc_meetings_participants.user_id",
          to: "users.custom_id",
        },
      },
      meeting: {
        relation: Model.BelongsToOneRelation,
        modelClass: meeting,
        join: {
          from: "cc_meetings_participants.meeting_id",
          to: "cc_meetings.id",
        },
      },
    };
  }
}

module.exports = CCMeetingsParticipants;
