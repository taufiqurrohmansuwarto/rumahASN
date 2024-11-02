/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .alterTable("messages", function (table) {
      table.string("user_id");
      table
        .foreign("user_id")
        .references("users.custom_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .alterTable("messages", function (table) {
      table.dropColumn("user_id");
    });
};
