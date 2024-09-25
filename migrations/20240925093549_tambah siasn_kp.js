/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// unor_nama: 'RSUD Dr. Soetomo Provinsi Jawa Timur',
//   unor_induk_id: 'RSUD Dr. Soetomo Provinsi Jawa Timur',
//  pendidikan_terakhir: 'S-3/DOKTOR',
//   jabatan_struktural: '',
//   jabatan_fungsional: 'Dokter Pendidik Klinis Ahli Utama',
//   jabatan_fungsional_umum: '',
//   tmt_jabatan_struktural: '',
//   tmt_jabatan_fungsional: '28-05-2019',
//   tmt_jabatan_fungsional_umum: '',
//   angka_kredit: '250.961',
//   kppn: 'BPKAD'

exports.up = function (knex) {
  return knex.schema.table("siasn_kp", function (table) {
    table.string("unor_nama").nullable();
    table.string("unor_induk_id").nullable();
    table.string("pendidikan_terakhir").nullable();
    table.string("jabatan_struktural").nullable();
    table.string("jabatan_fungsional").nullable();
    table.string("jabatan_fungsional_umum").nullable();
    table.string("tmt_jabatan_struktural").nullable();
    table.string("tmt_jabatan_fungsional").nullable();
    table.string("tmt_jabatan_fungsional_umum").nullable();
    table.string("kppn").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("siasn_kp", function (table) {
    table.dropColumn("unor_nama");
    table.dropColumn("unor_induk_id");
    table.dropColumn("pendidikan_terakhir");
    table.dropColumn("jabatan_struktural");
    table.dropColumn("jabatan_fungsional");
    table.dropColumn("jabatan_fungsional_umum");
    table.dropColumn("tmt_jabatan_struktural");
    table.dropColumn("tmt_jabatan_fungsional");
    table.dropColumn("tmt_jabatan_fungsional_umum");
    table.dropColumn("kppn");
  });
};
