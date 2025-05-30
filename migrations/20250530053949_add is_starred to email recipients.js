/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .alterTable("recipients", function (table) {
      // Add is_starred column for per-user starring functionality
      table.boolean("is_starred").defaultTo(false).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .alterTable("recipients", function (table) {
      table.dropColumn("is_starred");
    });
};
