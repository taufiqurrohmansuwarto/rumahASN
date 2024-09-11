/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("simaster_jft", function (table) {
    table.string("id").primary();
    table.string("pId");
    table.string("name");
    table.string("gol_ruang");
    table.string("angka_kredit");
    table.string("tunjangan_jab");
    table.integer("bup");
    table.string("diklat");
    table.string("ket");
    table.string("medis");
    table.string("jenjang_id");
    table.string("kualifikasi_id");
    table.string("uraian");
    table.string("url");
    table.string("open");
    table.string("kelas_jab");
    table.integer("ak_minimal");
    table.string("status_ak_minimal");
    table.string("ak_konvesional");
    table.string("skpd_pembina_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("simaster_jft");
};
