/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("leaderboard_quiz", (table) => {
    table.string("user_id").primary();
    table.foreign("user_id").references("users.custom_id");
    table.integer("score");
    table.dateTime("date");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
