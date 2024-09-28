/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .createTable("schedule_visits", (table) => {
      table.string("id").primary();
      table.string("guest_id");
      table
        .foreign("guest_id")
        .references("id")
        .inTable("guests_books.guests")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.dateTime("visit_date");
      table.string("purpose");
      table.string("description");
      table.jsonb("employee_visited");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("guests_books").dropTable("schedule_visits");
};
