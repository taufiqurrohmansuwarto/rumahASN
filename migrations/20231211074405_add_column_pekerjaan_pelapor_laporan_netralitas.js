/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("laporan_netralitas", (table) => {
    table.string("pekerjaan_pelapor");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("laporan_netralitas", (table) => {
    table.dropColumn("pekerjaan_pelapor");
  });
};
