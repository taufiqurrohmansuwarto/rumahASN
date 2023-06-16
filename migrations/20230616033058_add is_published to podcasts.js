/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // add column is_published to podcasts
  return knex.schema.alterTable("podcasts", function (table) {
    table.boolean("is_published").defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // remove column is_published from podcasts
  return knex.schema.alterTable("podcasts", function (table) {
    table.dropColumn("is_published");
  });
};
