/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_employees", function (table) {
    table.increments("id").primary();
    table.string("pns_id", 200);
    table.string("nip_baru", 200);
    table.string("nip_lama", 200);
    table.string("nama", 200);
    table.string("gelar_depan", 200);
    table.string("gelar_belakang", 200);
    table.string("tempat_lahir_id", 200);
    table.string("tempat_lahir_nama", 200);
    table.string("tanggal_lahir", 200);
    table.string("jenis_kelamin", 200);
    table.string("agama_id", 200);
    table.string("agama_nama", 200);
    table.string("jenis_kawin_id", 200);
    table.string("jenis_kawin_nama", 200);
    table.string("nik", 200);
    table.string("nomor_hp", 200);
    table.string("email", 200);
    table.string("email_gov", 200);
    table.string("alamat", 200);
    table.string("npwp_nomor", 200);
    table.string("bpjs", 200);
    table.string("jenis_pegawai_id", 200);
    table.string("jenis_pegawai_nama", 200);
    table.string("kedudukan_hukum_id", 200);
    table.string("kedudukan_hukum_nama", 200);
    table.string("status_cpns_pns", 200);
    table.string("kartu_asn_virtual", 200);
    table.string("nomor_sk_cpns", 200);
    table.string("tanggal_sk_cpns", 200);
    table.string("tmt_cpns", 200);
    table.string("nomor_sk_pns", 200);
    table.string("tanggal_sk_pns", 200);
    table.string("tmt_pns", 200);
    table.string("gol_awal_id", 200);
    table.string("gol_awal_nama", 200);
    table.string("gol_akhir_id", 200);
    table.string("gol_akhir_nama", 200);
    table.string("tmt_golongan", 200);
    table.string("mk_tahun", 200);
    table.string("mk_bulan", 200);
    table.string("jenis_jabatan_id", 200);
    table.string("jenis_jabatan_nama", 200);
    table.string("jabatan_id", 200);
    table.string("jabatan_nama", 200);
    table.string("tmt_jabatan", 200);
    table.string("tingkat_pendidikan_id", 200);
    table.string("tingkat_pendidikan_nama", 200);
    table.string("pendidikan_id", 200);
    table.string("pendidikan_nama", 200);
    table.string("tahun_lulus", 200);
    table.string("kpkn_id", 200);
    table.string("kpkn_nama", 200);
    table.string("lokasi_kerja_id", 200);
    table.string("lokasi_kerja_nama", 200);
    table.string("unor_id", 200);
    table.string("unor_nama", 200);
    table.string("instansi_induk_id", 200);
    table.string("instansi_induk_nama", 200);
    table.string("instansi_kerja_id", 200);
    table.string("instansi_kerja_nama", 200);
    table.string("satuan_kerja_induk_id", 200);
    table.string("satuan_kerja_induk_nama", 200);
    table.string("satuan_kerja_kerja_id", 200);
    table.string("satuan_kerja_kerja_nama", 200);
    table.string("is_valid_nik", 200);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_employees");
};
