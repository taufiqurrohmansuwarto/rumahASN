/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("webinar_series_pretests", function (table) {
    table.boolean("is_publish").defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("webinar_series_pretests", function (table) {
    table.dropColumn("is_publish");
  });
};
