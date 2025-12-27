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
    return [
      "custom_rules",
      "forbidden_words",
      "preferred_terms",
      "preferred_phrases",
      "avoided_phrases",
    ];
  }

  /**
   * Generate context string for AI review
   * Used when someone targets this user's preferences for document review
   * Enhanced to include all preference types with full details
   */
  generateAIContext() {
    const parts = [];

    // Language style description
    const styleDescriptions = {
      formal_lengkap: "Gunakan gaya bahasa formal lengkap dengan kalimat yang detail dan komprehensif",
      formal_ringkas: "Gunakan gaya bahasa formal tapi ringkas, langsung ke pokok permasalahan",
      semi_formal: "Gunakan gaya bahasa semi-formal, lebih fleksibel tapi tetap sopan",
      formal: "Gunakan gaya bahasa formal standar",
      standar: "Gunakan gaya bahasa standar sesuai Pergub Tata Naskah Dinas",
    };

    if (this.language_style) {
      parts.push(`Gaya Penulisan: ${styleDescriptions[this.language_style] || this.language_style}`);
    }

    // Preferred phrases (new format)
    if (this.preferred_phrases?.length > 0) {
      parts.push(`Frasa yang DISUKAI: ${this.preferred_phrases.join(", ")}`);
    }

    // Avoided phrases (new format)
    if (this.avoided_phrases?.length > 0) {
      parts.push(`Frasa yang DIHINDARI: ${this.avoided_phrases.join(", ")}`);
    }

    // Custom rules - include name AND description for full context
    if (this.custom_rules?.length > 0) {
      const rulesFormatted = this.custom_rules.map((r) => {
        if (typeof r === "string") return r;
        const name = r.name || "";
        const desc = r.description || "";
        const severity = r.severity ? ` [${r.severity}]` : "";
        return desc ? `${name}${severity}: ${desc}` : `${name}${severity}`;
      }).filter(Boolean);
      
      if (rulesFormatted.length > 0) {
        parts.push(`\nATURAN KHUSUS YANG HARUS DIPERHATIKAN:`);
        rulesFormatted.forEach((rule, idx) => {
          parts.push(`${idx + 1}. ${rule}`);
        });
      }
    }

    // Forbidden words (legacy format) - convert to full context
    if (this.forbidden_words?.length > 0) {
      const forbiddenFormatted = this.forbidden_words.map((fw) => {
        if (typeof fw === "string") return `"${fw}"`;
        const word = fw.word || "";
        const replacement = fw.replacement ? ` → ganti dengan "${fw.replacement}"` : "";
        const reason = fw.reason ? ` (alasan: ${fw.reason})` : "";
        return `"${word}"${replacement}${reason}`;
      }).filter(Boolean);
      
      if (forbiddenFormatted.length > 0) {
        parts.push(`\nKATA/FRASA YANG DILARANG:`);
        forbiddenFormatted.forEach((word) => {
          parts.push(`- ${word}`);
        });
      }
    }

    // Preferred terms (legacy format) - convert to full context
    if (this.preferred_terms?.length > 0) {
      const termsFormatted = this.preferred_terms.map((pt) => {
        if (typeof pt === "string") return pt;
        const original = pt.original || "";
        const preferred = pt.preferred || "";
        const context = pt.context ? ` (konteks: ${pt.context})` : "";
        return original && preferred ? `"${original}" → harus diganti "${preferred}"${context}` : null;
      }).filter(Boolean);
      
      if (termsFormatted.length > 0) {
        parts.push(`\nISTILAH YANG HARUS DIGANTI:`);
        termsFormatted.forEach((term) => {
          parts.push(`- ${term}`);
        });
      }
    }

    return parts.join("\n");
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

