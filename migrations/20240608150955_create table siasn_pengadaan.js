/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_pengadaan", (table) => {
    table.string("id").primary();
    table.string("orang_id");
    table.string("no_peserta");
    table.string("nip");
    table.string("nama");
    table.string("periode");
    table.string("instansi_id");
    table.string("no_pertek");
    table.string("no_sk");
    table.string("path_ttd_sk");
    table.string("path_ttd_pertek");
    table.timestamp("tgl_pertek");
    table.timestamp("tgl_sk");
    table.date("tgl_kontrak_mulai");
    table.date("tgl_kontrak_ahir");
    table.string("jenis_formasi_id");
    table.string("jenis_formasi_nama");
    table.integer("tahun_pengadaan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_pengadaan");
};
