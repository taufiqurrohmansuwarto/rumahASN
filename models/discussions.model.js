const { Model } = require("objection");
const knex = require("../db");
const uuid = require("uuid");

Model.knex(knex);

class Discussions extends Model {
  static get tableName() {
    return "discussions";
  }

  $beforeInsert() {
    this.id = uuid.v4();
  }

  static get modifiers() {
    return {
      simple(builder) {
        builder.select("id", "title", "created_by");
      },
    };
  }

  static get relationMappings() {
    const DiscussionVote = require("@/models/discussion-votes.model");
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "discussions.created_by",
          to: "users.custom_id",
        },
      },
      discussion: {
        relation: Model.BelongsToOneRelation,
        modelClass: Discussions,
        join: {
          from: "discussions.discussion_id",
          to: "discussions.id",
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
