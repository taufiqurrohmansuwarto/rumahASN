/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS seleksi_pengadaan_asn`)
    .then(() => {
      return knex.schema
        .withSchema("seleksi_pengadaan_asn")
        .createTable("meja_registrasi", (table) => {
          table.increments("id").primary();
          table.text("no");
          table.text("nomor_peserta");
          table.text("nama");
          table.text("lokasi_ujian");
          table.text("jadwal");
          table.text("sesi");
          table.text("jam");
          table.text("meja");
          table.timestamps(true, true);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("seleksi_pengadaan_asn")
    .dropTableIfExists("meja_registrasi")
    .then(() => {
      return knex.schema.raw(
        "DROP SCHEMA IF EXISTS seleksi_pengadaan_asn CASCADE"
      );
    });
};
