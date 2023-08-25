/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("webinar_series", function (table) {
    table.string("zoom_url");
    table.string("youtube_url");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("webinar_series", function (table) {
    table.dropColumn("zoom_url");
    table.dropColumn("youtube_url");
  });
};
