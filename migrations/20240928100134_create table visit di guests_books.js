/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .createTable("visits", function (table) {
      table.string("id").primary();
      table.string("guest_id");
      table.string("schedule_visit_id");
      table.dateTime("check_in_date");
      table.dateTime("check_out_date");
      table.string("status");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("guests_books").dropTable("visits");
};
