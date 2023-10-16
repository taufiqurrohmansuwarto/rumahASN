/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("questions_answers", (table) => {
    table.string("id").primary();
    table.text("question");
    table.text("option_a");
    table.text("option_b");
    table.text("option_c");
    table.text("option_d");
    table.text("option_e");
    table.string("correct_answer");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("questions_answers");
};
