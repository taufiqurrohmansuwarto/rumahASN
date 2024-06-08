/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", (table) => {
    table.renameColumn("tgl_kontrak_ahir", "tgl_kontrak_akhir");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", (table) => {
    table.renameColumn("tgl_kontrak_akhir", "tgl_kontrak_ahir");
  });
};
