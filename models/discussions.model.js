const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Discussions extends Model {
  static get tableName() {
    return "discussions";
  }

  static get relationMappings() {
    const DiscussionVote = require("./discussion-votes.model");
    const User = require("./users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "discussions.user_id",
          to: "users.custom_id",
        },
      },
      votes: {
        relation: Model.HasManyRelation,
        modelClass: DiscussionVote,
        join: {
          from: "discussions.id",
          to: "discussion_votes.discussion_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Discussions;
