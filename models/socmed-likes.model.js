const { Model } = require("objection");
const { nanoid } = require("nanoid");
const SocmedNotification = require("@/models/socmed-notifications.model");

const knex = require("../db");
Model.knex(knex);

class SocmedLikes extends Model {
  static get tableName() {
    return "socmed_likes";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }

  static get modifiers() {
    return {
      // select where user id
      whereUserId(query, userId) {
        query.where("user_id", userId).select("id");
      },
    };
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "socmed_likes.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext);

    await SocmedNotification.query().insert({
      user_id: this.user_id,
      trigger_user_id: this.user_id,
      type: "like",
      reference_id: this.id,
    });
  }
}

module.exports = SocmedLikes;
