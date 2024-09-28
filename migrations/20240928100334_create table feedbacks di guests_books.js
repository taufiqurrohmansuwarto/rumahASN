/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .createTable("feedbacks", function (table) {
      table.string("id").primary();
      table.string("guest_id");
      table.string("visit_id");
      table.string("feedback");
      table.string("rating");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("guests_books").dropTable("feedbacks");
};
