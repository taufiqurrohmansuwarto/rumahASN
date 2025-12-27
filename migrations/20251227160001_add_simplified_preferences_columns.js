/**
 * Migration: Add simplified preference columns to user_preferences
 *
 * New columns:
 * - preferred_phrases: jsonb - Frasa yang disukai user (string array)
 * - avoided_phrases: jsonb - Frasa yang dihindari user (string array)
 *
 * Also convert language_style from enum to text to allow new values
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_naskah")
    .alterTable("user_preferences", (table) => {
      // Add new columns for simplified preferences
      table.jsonb("preferred_phrases").nullable(); // ["Demikian disampaikan", "Atas perhatiannya..."]
      table.jsonb("avoided_phrases").nullable(); // ["Mohon maklum", "Terima kasih banyak"]
    })
    .then(() => {
      // Convert language_style from enum (check constraint) to text
      // This allows new values like 'formal_lengkap', 'formal_ringkas'
      return knex.raw(`
        -- Drop the check constraint for language_style enum
        ALTER TABLE rasn_naskah.user_preferences
        DROP CONSTRAINT IF EXISTS user_preferences_language_style_check;

        -- Change column type to text
        ALTER TABLE rasn_naskah.user_preferences
        ALTER COLUMN language_style TYPE text;

        -- Add new check constraint with all allowed values
        ALTER TABLE rasn_naskah.user_preferences
        ADD CONSTRAINT user_preferences_language_style_check
        CHECK (language_style IN ('formal', 'semi_formal', 'standar', 'formal_lengkap', 'formal_ringkas'));
      `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("rasn_naskah")
    .alterTable("user_preferences", (table) => {
      table.dropColumn("preferred_phrases");
      table.dropColumn("avoided_phrases");
    })
    .then(() => {
      // Revert language_style check constraint to original values
      return knex.raw(`
        ALTER TABLE rasn_naskah.user_preferences
        DROP CONSTRAINT IF EXISTS user_preferences_language_style_check;

        ALTER TABLE rasn_naskah.user_preferences
        ADD CONSTRAINT user_preferences_language_style_check
        CHECK (language_style IN ('formal', 'semi_formal', 'standar'));
      `);
    });
};
