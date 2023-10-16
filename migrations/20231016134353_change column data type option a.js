/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("questions_answers", (table) => {
    table.jsonb("option_a").alter();
    table.jsonb("option_b").alter();
    table.jsonb("option_c").alter();
    table.jsonb("option_d").alter();
    table.jsonb("option_e").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
