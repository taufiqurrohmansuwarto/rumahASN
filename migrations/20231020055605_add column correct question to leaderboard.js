/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("leaderboard_quiz", function (table) {
    table.specificType("correct_question", "TEXT[]").defaultTo("{}");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("leaderboard_quiz", function (table) {
    table.dropColumn("correct_question");
  });
};
