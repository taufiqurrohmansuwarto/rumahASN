const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class UserPreferences extends Model {
  static get tableName() {
    return "rasn_naskah.user_preferences";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.user_preferences.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get jsonAttributes() {
    return ["custom_rules", "forbidden_words", "preferred_terms"];
  }

  // Get or create preferences for user
  static async getOrCreate(userId) {
    let preferences = await UserPreferences.query()
      .where("user_id", userId)
      .first();

    if (!preferences) {
      preferences = await UserPreferences.query().insert({
        user_id: userId,
        language_style: "standar",
        auto_check_spelling: true,
        auto_check_grammar: true,
      });
    }

    return preferences;
  }

  // Update preferences
  static async updatePreferences(userId, data) {
    const existing = await UserPreferences.query()
      .where("user_id", userId)
      .first();

    if (existing) {
      return UserPreferences.query()
        .patchAndFetchById(existing.id, data);
    }

    return UserPreferences.query().insert({
      user_id: userId,
      ...data,
    });
  }
}

module.exports = UserPreferences;

