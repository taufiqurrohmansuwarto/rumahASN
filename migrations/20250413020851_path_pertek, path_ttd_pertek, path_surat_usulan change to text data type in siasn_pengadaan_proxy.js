/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan_proxy", (table) => {
    table.text("path_pertek").alter();
    table.text("path_ttd_pertek").alter();
    table.text("path_surat_usulan").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan_proxy", (table) => {
    table.string("path_pertek").alter();
    table.string("path_ttd_pertek").alter();
    table.string("path_surat_usulan").alter();
  });
};
