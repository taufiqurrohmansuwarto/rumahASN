/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_ringkasan_analisis", (table) => {
    table.increments("id").primary();
    table.string("jenis_data").notNullable(); // 'KP', 'Pengadaan', dsb
    table.date("tgl_analisis").notNullable(); // TMT atau tanggal snapshot
    table.string("kategori").notNullable(); // 'SKP', 'PAK', dsb
    table.integer("jumlah_alasan");
    table.specificType("daftar_alasan", "text[]"); // array alasan
    table.text("ringkasan").notNullable(); // hasil GPT
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_ringkasan_analisis");
};
