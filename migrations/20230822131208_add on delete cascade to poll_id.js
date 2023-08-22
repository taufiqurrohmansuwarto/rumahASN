/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("polls_answers", (table) => {
    table.dropForeign("poll_id");
    table
      .foreign("poll_id")
      .references("polls.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("polls_answers", (table) => {
    table.dropForeign("poll_id");
    table.foreign("poll_id").references("polls.id");
  });
};
