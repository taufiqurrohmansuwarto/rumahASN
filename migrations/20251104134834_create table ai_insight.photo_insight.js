/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ai_insight")
    .createTable("photo_insight", (table) => {
      table.increments("id").primary();
      table.string("nip").unique();
      table.string("nama");
      table.string("jenis_jabatan");
      table.string("eselon_id");
      table.string("original_photo_url");

      table.string("detected_bg_hex");
      table.string("detected_bg_color");
      table.string("required_bg_hex");
      table.string("required_bg_label");
      table.boolean("is_bg_valid");

      table.boolean("background_fixed");
      table.string("corrected_image_url");

      table.jsonb("ai_insight");
      table.jsonb("analysis_data");

      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
