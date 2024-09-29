/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .alterTable("guests", (table) => {
      table.string("institution");
      table.string("visitor_type");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .alterTable("guests", (table) => {
      table.dropColumn("institution");
      table.dropColumn("visitor_type");
    });
};
