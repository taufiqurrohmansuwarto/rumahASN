/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("submissions_references", function (table) {
    table.specificType("submitter_type", "text ARRAY").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("submissions_references", function (table) {
    table.string("submitter_type").alter();
  });
};
