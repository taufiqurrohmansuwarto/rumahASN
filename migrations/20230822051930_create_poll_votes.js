/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("polls_votes", function (table) {
    table.integer("poll_id");
    table.string("user_id");
    table.foreign("poll_id").references("polls.id");
    table.foreign("user_id").references("users.custom_id");
    table.primary(["poll_id", "user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("polls_votes");
};
