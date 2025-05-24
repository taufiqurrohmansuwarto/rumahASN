const { Model } = require("objection");
const knex = require("../../db");
const nanoid = require("nanoid");

Model.knex(knex);

class UserSettings extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.user_settings";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.user_settings.user_id",
          to: "public.users.custom_id",
        },
      },
    };
  }

  // Static method untuk get or create user settings
  static async getOrCreateForUser(userId) {
    let settings = await UserSettings.query().findOne({ user_id: userId });

    if (!settings) {
      settings = await UserSettings.query().insert({
        user_id: userId,
        signature: "",
        email_notifications: true,
        emails_per_page: 25,
        auto_mark_read: false,
      });
    }

    return settings;
  }
}

module.exports = UserSettings;
