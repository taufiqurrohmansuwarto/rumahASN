/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("tickets", (table) => {
    table.boolean("is_pin").defaultTo(false);
    table.boolean("is_locked").defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("tickets", (table) => {
    table.dropColumn("is_pin");
    table.dropColumn("is_locked");
  });
};
