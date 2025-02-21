/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", function (table) {
    table.string("golongan_id");
    table.string("gaji_pokok");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", function (table) {
    table.dropColumn("golongan_id");
    table.dropColumn("gaji_pokok");
  });
};
