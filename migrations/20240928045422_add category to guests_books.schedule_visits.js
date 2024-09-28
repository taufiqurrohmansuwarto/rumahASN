/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .alterTable("schedule_visits", (table) => {
      table.string("category");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .alterTable("schedule_visits", (table) => {
      table.dropColumn("category");
    });
};
