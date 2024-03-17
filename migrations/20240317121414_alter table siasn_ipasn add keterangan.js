/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_ipasn", function (table) {
    table.string("keterangan_kualifikasi");
    table.string("keterangan_kompetensi");
    table.string("keterangan_kinerja");
    table.string("keterangan_disiplin");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_ipasn", function (table) {
    table.dropColumn("keterangan_kualifikasi");
    table.dropColumn("keterangan_kompetensi");
    table.dropColumn("keterangan_kinerja");
    table.dropColumn("keterangan_disiplin");
  });
};
