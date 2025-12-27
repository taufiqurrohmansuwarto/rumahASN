const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class SuperiorPreferences extends Model {
  static get tableName() {
    return "rasn_naskah.superior_preferences";
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
          from: "rasn_naskah.superior_preferences.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get jsonAttributes() {
    return ["preferred_phrases", "disliked_phrases"];
  }

  static get modifiers() {
    return {
      byUser(query, userId) {
        query.where("user_id", userId);
      },
      active(query) {
        query.where("is_active", true);
      },
      orderByDisplay(query) {
        query.orderBy("display_order", "asc");
      },
    };
  }

  // Helper untuk mendapatkan label gaya bahasa
  get languageStyleLabel() {
    const labels = {
      sangat_formal: "Sangat Formal",
      formal: "Formal",
      semi_formal: "Semi Formal",
      ringkas: "Ringkas & To The Point",
    };
    return labels[this.language_style] || this.language_style;
  }

  // Helper untuk mendapatkan deskripsi gaya bahasa
  get languageStyleDescription() {
    const descriptions = {
      sangat_formal: "Menggunakan bahasa yang sangat formal dan kaku, cocok untuk dokumen resmi tingkat tinggi",
      formal: "Menggunakan bahasa formal standar sesuai kaidah tata naskah dinas",
      semi_formal: "Menggunakan bahasa yang sedikit lebih fleksibel namun tetap sopan",
      ringkas: "Prefer kalimat singkat, padat, dan langsung ke inti pembahasan",
    };
    return descriptions[this.language_style] || "";
  }

  // Helper untuk mendapatkan label panjang paragraf
  get paragraphLengthLabel() {
    const labels = {
      short: "Pendek (2-3 kalimat)",
      medium: "Sedang (4-5 kalimat)",
      long: "Panjang (6+ kalimat)",
    };
    return labels[this.paragraph_length] || this.paragraph_length;
  }

  // Get active superiors for user
  static async getForUser(userId) {
    return SuperiorPreferences.query()
      .where("user_id", userId)
      .where("is_active", true)
      .orderBy("display_order", "asc");
  }

  // Create or update superior preference
  static async upsert(userId, data) {
    const existing = data.id
      ? await SuperiorPreferences.query().findById(data.id)
      : null;

    if (existing && existing.user_id === userId) {
      return SuperiorPreferences.query().patchAndFetchById(data.id, {
        superior_name: data.superior_name,
        superior_position: data.superior_position,
        language_style: data.language_style,
        notes: data.notes,
        preferred_phrases: data.preferred_phrases,
        disliked_phrases: data.disliked_phrases,
        paragraph_length: data.paragraph_length,
        is_active: data.is_active ?? true,
        display_order: data.display_order ?? 0,
      });
    }

    return SuperiorPreferences.query().insert({
      user_id: userId,
      superior_name: data.superior_name,
      superior_position: data.superior_position,
      language_style: data.language_style || "formal",
      notes: data.notes,
      preferred_phrases: data.preferred_phrases,
      disliked_phrases: data.disliked_phrases,
      paragraph_length: data.paragraph_length || "medium",
      is_active: data.is_active ?? true,
      display_order: data.display_order ?? 0,
    });
  }

  // Generate prompt context for AI based on superior preferences
  generateAIContext() {
    let context = `GAYA BAHASA - ${this.superior_name}`;
    if (this.superior_position) {
      context += ` (${this.superior_position})`;
    }
    context += "\n\n";

    // Language style
    context += `Gaya bahasa yang disukai: ${this.languageStyleLabel}\n`;
    context += `${this.languageStyleDescription}\n\n`;

    // Paragraph length
    context += `Panjang paragraf: ${this.paragraphLengthLabel}\n\n`;

    // Notes
    if (this.notes) {
      context += `Catatan khusus: ${this.notes}\n\n`;
    }

    // Preferred phrases
    if (this.preferred_phrases && this.preferred_phrases.length > 0) {
      context += `Frasa yang disukai:\n`;
      for (const phrase of this.preferred_phrases) {
        context += `- "${phrase}"\n`;
      }
      context += "\n";
    }

    // Disliked phrases
    if (this.disliked_phrases && this.disliked_phrases.length > 0) {
      context += `Frasa yang TIDAK disukai (hindari):\n`;
      for (const phrase of this.disliked_phrases) {
        context += `- "${phrase}"\n`;
      }
    }

    return context;
  }
}

module.exports = SuperiorPreferences;
