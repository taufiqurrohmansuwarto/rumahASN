/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("polls_votes", (table) => {
    table.dropForeign("answer_id");
    table
      .foreign("answer_id")
      .references("polls_answers.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("polls_votes", (table) => {
    table.dropForeign("answer_id");
    table.foreign("answer_id").references("polls_answers.id");
  });
};
