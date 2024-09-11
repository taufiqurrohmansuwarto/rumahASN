/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("simaster_jfu", function (table) {
    table.string("kualifikasi_d");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("simaster_jfu", function (table) {
    table.dropColumn("kualifikasi_d");
  });
};
