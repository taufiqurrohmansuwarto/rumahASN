/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("questions_answers", (table) => {
    table.increments("id").primary();
    table.text("question");
    table.jsonb("option_a");
    table.jsonb("option_b");
    table.jsonb("option_c");
    table.jsonb("option_d");
    table.jsonb("option_e");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
