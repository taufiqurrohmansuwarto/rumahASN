/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_employees", (table) => {
    table.increments("id").primary();
    table.text("pns_id");
    table.text("nip_baru");
    table.text("nip_lama");
    table.text("nama");
    table.text("gelar_depan");
    table.text("gelar_belakang");
    table.text("tempat_lahir_id");
    table.text("tempat_lahir_nama");
    table.text("tanggal_lahir");
    table.text("jenis_kelamin");
    table.text("agama_id");
    table.text("agama_nama");
    table.text("jenis_kawin_id");
    table.text("jenis_kawin_nama");
    table.text("nik");
    table.text("nomor_hp");
    table.text("email");
    table.text("email_gov");
    table.text("alamat");
    table.text("npwp_nomor");
    table.text("bpjs");
    table.text("jenis_pegawai_id");
    table.text("jenis_pegawai_nama");
    table.text("kedudukan_hukum_id");
    table.text("kedudukan_hukum_nama");
    table.text("status_cpns_pns");
    table.text("kartu_asn_virtual");
    table.text("nomor_sk_cpns");
    table.text("tanggal_sk_cpns");
    table.text("tmt_cpns");
    table.text("nomor_sk_pns");
    table.text("tanggal_sk_pns");
    table.text("tmt_pns");
    table.text("gol_awal_id");
    table.text("gol_awal_nama");
    table.text("gol_akhir_id");
    table.text("gol_akhir_nama");
    table.text("tmt_golongan");
    table.text("mk_tahun");
    table.text("mk_bulan");
    table.text("jenis_jabatan_id");
    table.text("jenis_jabatan_nama");
    table.text("jabatan_id");
    table.text("jabatan_nama");
    table.text("tmt_jabatan");
    table.text("tingkat_pendidikan_id");
    table.text("tingkat_pendidikan_nama");
    table.text("pendidikan_id");
    table.text("pendidikan_nama");
    table.text("tahun_lulus");
    table.text("kpkn_id");
    table.text("kpkn_nama");
    table.text("lokasi_kerja_id");
    table.text("lokasi_kerja_nama");
    table.text("unor_id");
    table.text("unor_nama");
    table.text("instansi_induk_id");
    table.text("instansi_induk_nama");
    table.text("instansi_kerja_id");
    table.text("instansi_kerja_nama");
    table.text("satuan_kerja_induk_id");
    table.text("satuan_kerja_induk_nama");
    table.text("satuan_kerja_kerja_id");
    table.text("satuan_kerja_kerja_nama");
    table.text("is_valid_nik");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_employees");
};
