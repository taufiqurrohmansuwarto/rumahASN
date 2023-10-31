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
  static get relationMappings() {
    const user = require("@/models/users.model");
    const participants = require("@/models/cc_meetings_participants.model");
    const rating = require("@/models/cc_ratings.model");

    return {
      ratings: {
        relation: Model.HasManyRelation,
        modelClass: rating,
        join: {
          from: "cc_meetings.id",
          to: "cc_ratings.meeting_id",
        },
      },
      coach: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "cc_meetings.user_id",
          to: "users.custom_id",
        },
      },
      participants: {
        relation: Model.HasManyRelation,
        modelClass: participants,
        join: {
          from: "cc_meetings.id",
          to: "cc_meetings_participants.meeting_id",
        },
      },
    };
  }
}

module.exports = CCMeetings;
