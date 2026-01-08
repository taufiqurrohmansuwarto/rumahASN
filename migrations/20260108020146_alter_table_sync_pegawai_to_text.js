/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sync_pegawai", function (table) {
    table.text("foto").alter();
    table.text("jabatan_asn").alter();
    table.text("skpd_id").alter();
    table.text("nama_master").alter();
    table.text("nip_master").alter();
    table.text("opd_master").alter();
    table.text("email_master").alter();
    table.text("tgl_lahir_master").alter();
    table.text("gelar_depan_master").alter();
    table.text("gelar_belakang_master").alter();
    table.text("jenjang_master").alter();
    table.text("prodi_master").alter();
    table.text("golongan_master").alter();
    table.text("pangkat_master").alter();
    table.text("jenis_jabatan").alter();
    table.text("jabatan_master").alter();
    table.text("status_master").alter();
    table.text("kode_golongan_bkn").alter();
    table.text("kode_jenis_jabatan_bkn").alter();
    table.text("kode_jenjang_master").alter();
    table.text("kelas_jabatan").alter();
    table.text("bup").alter();
    table.text("tmt_pensiun").alter();
    table.text("no_hp_master").alter();
    table.text("no_sk_cpns").alter();
    table.text("no_sk_pns").alter();
    table.text("tgl_sk_cpns").alter();
    table.text("tgl_sk_pns").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sync_pegawai", function (table) {
    table.string("foto").alter();
    table.string("jabatan_asn").alter();
    table.string("skpd_id").alter();
    table.string("nama_master").alter();
    table.string("nip_master").alter();
    table.string("opd_master").alter();
    table.string("email_master").alter();
    table.string("tgl_lahir_master").alter();
    table.string("gelar_depan_master").alter();
    table.string("gelar_belakang_master").alter();
    table.string("jenjang_master").alter();
    table.string("prodi_master").alter();
    table.string("golongan_master").alter();
    table.string("pangkat_master").alter();
    table.string("jenis_jabatan").alter();
    table.string("jabatan_master").alter();
    table.string("status_master").alter();
    table.string("kode_golongan_bkn").alter();
    table.string("kode_jenis_jabatan_bkn").alter();
    table.string("kode_jenjang_master").alter();
    table.string("kelas_jabatan").alter();
    table.string("bup").alter();
    table.string("tmt_pensiun").alter();
    table.string("no_hp_master").alter();
    table.string("no_sk_cpns").alter();
    table.string("no_sk_pns").alter();
    table.string("tgl_sk_cpns").alter();
    table.string("tgl_sk_pns").alter();
  });
};
