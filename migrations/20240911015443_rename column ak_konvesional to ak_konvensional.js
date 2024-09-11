/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("simaster_jft", function (table) {
    table.renameColumn("ak_konvesional", "ak_konvensional");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("simaster_jft", function (table) {
    table.renameColumn("ak_konvensional", "ak_konvesional");
  });
};
