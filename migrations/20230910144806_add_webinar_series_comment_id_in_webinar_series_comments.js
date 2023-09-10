/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("webinar_series_comments", function (table) {
    table.string("webinar_series_comment_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("webinar_series_comments", function (table) {
    table.dropColumn("webinar_series_comment_id");
  });
};
