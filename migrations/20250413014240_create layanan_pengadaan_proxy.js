/** all text
 * id
orang_id
usulan_data jsonb
status_usulan
dokumen_usulan jsonb
tgl_usulan
tgl_pengiriman_kelayanan
tgl_update_layanan
instansi_id
keterangan
status_aktif
no_surat_usulan
status_paraf_pertek
provinsi_nama
nip
nama
instansi_nama
jenis_layanan_nama
no_surat_keluar
tgl_surat_keluar
path_pertek
path_ttd_pertek
path_surat_usulan
pejabat_paraf_id
pejabat_ttd_id
uraian_perbaikan
uraian_pembatalan
nama_tabel_riwayat
id_riwayat_update
no_sk
path_paraf_sk
pejabat_paraf_sk
status_paraf_sk
tgl_paraf_sk
path_ttd_sk
pejabat_ttd_sk
tgl_ttd_sk
status_ttd_sk
no_pertek
referensi_instansi
tgl_sk
tgl_pertek
alasan_tolak_id
alasan_tolak_tambahan
generated_nomor
periode
jenis_formasi_id
jenis_formasi_nama
jenis_pegawai_id
status_kerja_induk_id
satuan_kerja_induk_nama
instansi_induk_id
instansi_induk_nama
tgl_kontrak_mulai
tgl_kontrak_akhir
no_urut
nip_approval
path_dokumen_pembatalan
tahun_formasi
flag_otomatisasi
dokumen_baru
dokumen_lama
flag_perbaikan_dokumen 
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_pengadaan_proxy", (table) => {
    table.string("id").primary();
    table.string("orang_id");
    table.jsonb("usulan_data");
    table.string("status_usulan");
    table.jsonb("dokumen_usulan");
    table.string("tgl_usulan");
    table.string("tgl_pengiriman_kelayanan");
    table.string("tgl_update_layanan");
    table.string("instansi_id");
    table.string("keterangan");
    table.string("status_aktif");
    table.string("no_surat_usulan");
    table.string("status_paraf_pertek");
    table.string("provinsi_nama");
    table.string("nip");
    table.string("nama");
    table.string("instansi_nama");
    table.string("jenis_layanan_nama");
    table.string("no_surat_keluar");
    table.string("tgl_surat_keluar");
    table.string("path_pertek");
    table.string("path_ttd_pertek");
    table.string("path_surat_usulan");
    table.string("pejabat_paraf_id");
    table.string("pejabat_ttd_id");
    table.string("uraian_perbaikan");
    table.string("uraian_pembatalan");
    table.string("nama_tabel_riwayat");
    table.string("id_riwayat_update");
    table.string("no_sk");
    table.string("path_paraf_sk");
    table.string("pejabat_paraf_sk");
    table.string("status_paraf_sk");
    table.string("tgl_paraf_sk");
    table.string("path_ttd_sk");
    table.string("pejabat_ttd_sk");
    table.string("tgl_ttd_sk");
    table.string("status_ttd_sk");
    table.string("no_pertek");
    table.string("referensi_instansi");
    table.string("tgl_sk");
    table.string("tgl_pertek");
    table.string("alasan_tolak_id");
    table.string("alasan_tolak_tambahan");
    table.string("generated_nomor");
    table.string("periode");
    table.string("jenis_formasi_id");
    table.string("jenis_formasi_nama");
    table.string("jenis_pegawai_id");
    table.string("status_kerja_induk_id");
    table.string("satuan_kerja_induk_nama");
    table.string("instansi_induk_id");
    table.string("instansi_induk_nama");
    table.string("tgl_kontrak_mulai");
    table.string("tgl_kontrak_akhir");
    table.string("no_urut");
    table.string("nip_approval");
    table.string("path_dokumen_pembatalan");
    table.string("tahun_formasi");
    table.string("flag_otomatisasi");
    table.string("dokumen_baru");
    table.string("dokumen_lama");
    table.string("flag_perbaikan_dokumen");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_pengadaan_proxy");
};
