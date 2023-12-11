/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("laporan_netralitas", (table) => {
    table.string("id").primary();
    table.string("kode_laporan");
    table.string("nama_pelapor");
    table.string("nip_pelapor");
    table.string("jabatan_instansi_pelapor");
    table.string("no_hp_pelapor");
    table.string("email_pelapor");
    table.string("alamat_pelapor");

    //     terlapor
    table.string("nama_terlapor");
    table.string("nip_terlapor");
    table.string("jabatan_instansi_terlapor");
    table.text("laporan");
    table.specificType("files", "text ARRAY");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("laporan_netralitas");
};
