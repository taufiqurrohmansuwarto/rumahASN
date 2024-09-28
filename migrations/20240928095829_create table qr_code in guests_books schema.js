/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .createTable("qr_code", function (table) {
      table.string("id").primary();
      table.string("guest_id");
      table.string("schedule_visit_id");

      table
        .foreign("guest_id")
        .references("id")
        .inTable("guests_books.guests")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .foreign("schedule_visit_id")
        .references("id")
        .inTable("guests_books.schedule_visits")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.string("status");
      table.timestamp("expired_at");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("guests_books").dropTable("qr_code");
};
