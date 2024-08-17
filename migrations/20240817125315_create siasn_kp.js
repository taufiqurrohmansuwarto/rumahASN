/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema.createTable("siasn_kp", (table) => {
    table.string("id").primary();
    table.string("pnsId");
    table.string("statusUsulan");
    table.string("statusUsulanNama");
    table.string("nipBaru");
    table.string("nama");
    table.string("no_pertek");
    table.string("no_sk");
    table.string("path_ttd_sk");
    table.string("path_ttd_pertek");
    table.string("tgl_pertek");
    table.string("tgl_sk");
    table.string("golonganBaruId");
    table.string("tmtKp");
    table.string("path_preview_sk");
    table.string("gaji_pokok_baru");
    table.string("gaji_pokok_lama");
    table.string("masa_kerja_tahun");
    table.string("masa_kerja_bulan");
    table.string("jenis_kp");
    table.string("jenis_prosedur");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_kp");
};
