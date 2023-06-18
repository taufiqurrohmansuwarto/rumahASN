/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("podcasts", (table) => {
    // episode
    table.integer("episode");
    table.text("short_description");
    table.text("transcript");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("podcasts", (table) => {
    // episode
    table.dropColumn("episode");
    table.dropColumn("short_description");
    table.dropColumn("transcript");
  });
};
