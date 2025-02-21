/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", function (table) {
    table.string("mk_bulan");
    table.string("mk_tahun");
    table.string("pendidikan_id");
    table.string("tk_pendidikan_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", function (table) {
    table.dropColumn("mk_bulan");
    table.dropColumn("mk_tahun");
    table.dropColumn("pendidikan_id");
    table.dropColumn("tk_pendidikan_id");
  });
};
