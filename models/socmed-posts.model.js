const { Model } = require("objection");
const { nanoid } = require("nanoid");
const SocmedAudits = require("./socmed-audits.model");
const SocmedNotifications = require("./socmed-notifications.model");

const knex = require("../db");
const { isEmpty } = require("lodash");
Model.knex(knex);

class SocmedPosts extends Model {
  static get tableName() {
    return "socmed_posts";
  }

  static get idColumn() {
    return "id";
  }

  static async auditLog(action, oldValue, newValue, userId, id) {
    await SocmedAudits.query().insert({
      action_type: action,
      record_id: id,
      table_name: "socmed_posts",
      old_value: JSON.stringify(oldValue),
      new_value: JSON.stringify(newValue),
      user_id: userId,
    });
  }

  // custom filter function
  static get modifiers() {
    return {
      simple: (builder) => {
        builder.select("id", "user_id", "content", "created_at");
      },
    };
  }

  static get relationMappings() {
    const Like = require("./socmed-likes.model");
    const Comment = require("./socmed-comments.model");
    const Share = require("./socmed-shares.model");
    const User = require("./users.model");

    return {
      likes: {
        relation: Model.HasManyRelation,
        modelClass: Like,
        join: {
          from: "socmed_posts.id",
          to: "socmed_likes.post_id",
        },
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: "socmed_posts.id",
          to: "socmed_comments.post_id",
        },
      },
      shares: {
        relation: Model.HasManyRelation,
        modelClass: Share,
        join: {
          from: "socmed_posts.id",
          to: "socmed_shares.post_id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "socmed_posts.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  async $beforeInsert(queryContext) {
    this.id = nanoid(8);
    console.log(this);
    await super.$beforeInsert(queryContext);
    await SocmedPosts.auditLog("INSERT", {}, this, this.user_id, this.id);
    await SocmedNotifications.query().insert({
      user_id: this.user_id,
      trigger_user_id: null,
      type: "post",
      reference_id: this.id,
    });
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    // jika data kosong, maka tidak perlu di audit. Terjadi ketika tambah like
    if (isEmpty(this)) {
      return;
    } else {
      const oldValue = await SocmedPosts.query().findById(this.id);
      await SocmedPosts.auditLog(
        "UPDATE",
        oldValue,
        this,
        this.user_id,
        this.id
      );
    }
  }

  async $beforeDelete(queryContext) {
    await super.$beforeDelete(queryContext);
    const oldValue = await SocmedPosts.query().findById(this.id);
    await SocmedPosts.auditLog("DELETE", oldValue, {}, this.user_id, this.id);
  }
}

module.exports = SocmedPosts;
