/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sync_pegawai", (table) => {
    table.string("kode_golongan_bkn").alter();
    table.string("kode_jenis_jabatan_bkn").alter();
    table.string("kode_jenjang_master").alter();
    table.string("kelas_jabatan").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sync_pegawai", (table) => {
    table.integer("kode_golongan_bkn").alter();
    table.integer("kode_jenis_jabatan_bkn").alter();
    table.integer("kode_jenjang_master").alter();
    table.integer("kelas_jabatan").alter();
  });
};
