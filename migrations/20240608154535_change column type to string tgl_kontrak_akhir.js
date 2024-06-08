/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", (table) => {
    table.string("tgl_kontrak_akhir").nullable().alter();
    table.string("tgl_kontrak_mulai").nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan", (table) => {
    table.date("tgl_kontrak_akhir").nullable().alter();
    table.date("tgl_kontrak_mulai").nullable().alter();
  });
};
