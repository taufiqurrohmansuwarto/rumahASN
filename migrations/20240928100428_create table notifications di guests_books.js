/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .createTable("notifications", function (table) {
      table.string("id").primary();
      table.string("employee_id");
      table.string("visit_id");

      table
        .foreign("employee_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table
        .foreign("visit_id")
        .references("id")
        .inTable("guests_books.visits")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.dateTime("sent_at");
      table.string("status");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("guests_books").dropTable("notifications");
};
