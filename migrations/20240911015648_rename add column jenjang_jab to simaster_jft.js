/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("simaster_jft", function (table) {
    table.string("jenjang_jab");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("simaster_jft", function (table) {
    table.dropColumn("jenjang_jab");
  });
};