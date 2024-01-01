const { Model } = require("objection");
const { nanoid } = require("nanoid");
const SocmedNotification = require("@/models/socmed-notifications.model");
const SocmedPosts = require("@/models/socmed-posts.model");

const knex = require("../db");
Model.knex(knex);

class SocmedComments extends Model {
  static get tableName() {
    return "socmed_comments";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "socmed_comments.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  async $afterInsert(queryContext) {
    console.log("after insert");
    await super.$afterInsert(queryContext);
    await SocmedNotification.query().insert({
      user_id: this.user_id,
      trigger_user_id: this.user_id,
      type: "comment",
      reference_id: this.post_id,
    });
  }
}

module.exports = SocmedComments;
