/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan_proxy", function (table) {
    table.string("pendidikan_ijazah_nama");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan_proxy", function (table) {
    table.dropColumn("pendidikan_ijazah_nama");
  });
};
