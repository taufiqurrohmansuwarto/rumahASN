/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("polls_answers", function (table) {
    table.increments("id").primary();
    table.integer("poll_id").unsigned().notNullable();
    table.string("answer").notNullable();
    table.string("user_id");
    table.foreign("poll_id").references("polls.id");
    table.foreign("user_id").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("polls_answers");
};
