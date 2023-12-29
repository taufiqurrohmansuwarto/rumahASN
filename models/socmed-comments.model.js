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

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext);

    const post = await SocmedPosts.query().findById(this.post_id);

    // cek jika pengguna bukan yang membuat postingan
    if (post.user_id !== this.user_id) {
      // jika bukan, maka buat notifikasi
      await SocmedNotification.query().insert({
        user_id: this.user_id,
        trigger_user_id: this.user_id,
        type: "comment",
        reference_id: this.id,
      });
    }
  }
}

module.exports = SocmedComments;
