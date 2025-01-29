/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .alterTable("messages", (table) => {
      table.integer("response").defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .alterTable("messages", (table) => {
      table.dropColumn("response");
    });
};
