/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .alterTable("chat_threads", function (table) {
      table.string("assistant_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .alterTable("chat_threads", function (table) {
      table.dropColumn("assistant_id");
    });
};
