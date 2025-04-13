/**
 * create table if not exists public.siasn_pengadaan_proxy
(
    id                       varchar(255) not null
        primary key,
    orang_id                 varchar(255),
    usulan_data              jsonb,
    status_usulan            varchar(255),
    dokumen_usulan           jsonb,
    tgl_usulan               varchar(255),
    tgl_pengiriman_kelayanan varchar(255),
    tgl_update_layanan       varchar(255),
    instansi_id              varchar(255),
    keterangan               varchar(255),
    status_aktif             varchar(255),
    no_surat_usulan          varchar(255),
    status_paraf_pertek      varchar(255),
    provinsi_nama            varchar(255),
    nip                      varchar(255),
    nama                     varchar(255),
    instansi_nama            varchar(255),
    jenis_layanan_nama       varchar(255),
    no_surat_keluar          varchar(255),
    tgl_surat_keluar         varchar(255),
    path_pertek              text,
    path_ttd_pertek          text,
    path_surat_usulan        text,
    pejabat_paraf_id         varchar(255),
    pejabat_ttd_id           varchar(255),
    uraian_perbaikan         varchar(255),
    uraian_pembatalan        varchar(255),
    nama_tabel_riwayat       varchar(255),
    id_riwayat_update        varchar(255),
    no_sk                    varchar(255),
    path_paraf_sk            varchar(255),
    pejabat_paraf_sk         varchar(255),
    status_paraf_sk          varchar(255),
    tgl_paraf_sk             varchar(255),
    path_ttd_sk              varchar(255),
    pejabat_ttd_sk           varchar(255),
    tgl_ttd_sk               varchar(255),
    status_ttd_sk            varchar(255),
    no_pertek                varchar(255),
    referensi_instansi       varchar(255),
    tgl_sk                   varchar(255),
    tgl_pertek               varchar(255),
    alasan_tolak_id          varchar(255),
    alasan_tolak_tambahan    varchar(255),
    generated_nomor          varchar(255),
    periode                  varchar(255),
    jenis_formasi_id         varchar(255),
    jenis_formasi_nama       varchar(255),
    jenis_pegawai_id         varchar(255),
    status_kerja_induk_id    varchar(255),
    satuan_kerja_induk_nama  varchar(255),
    instansi_induk_id        varchar(255),
    instansi_induk_nama      varchar(255),
    tgl_kontrak_mulai        varchar(255),
    tgl_kontrak_akhir        varchar(255),
    no_urut                  varchar(255),
    nip_approval             varchar(255),
    path_dokumen_pembatalan  varchar(255),
    tahun_formasi            varchar(255),
    flag_otomatisasi         varchar(255),
    dokumen_baru             varchar(255),
    dokumen_lama             varchar(255),
    flag_perbaikan_dokumen   varchar(255),
    satuan_kerja_induk_id    varchar(255),
    status_ttd_paraf_pertek  varchar(255),
    tgl_surat_usulan         varchar(255)
);

 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan_proxy", (table) => {
    table.text("orang_id").alter();
    table.text("status_usulan").alter();
    table.text("dokumen_usulan").alter();
    table.text("tgl_usulan").alter();
    table.text("tgl_pengiriman_kelayanan").alter();
    table.text("tgl_update_layanan").alter();
    table.text("instansi_id").alter();
    table.text("keterangan").alter();
    table.text("status_aktif").alter();
    table.text("no_surat_usulan").alter();
    table.text("status_paraf_pertek").alter();
    table.text("provinsi_nama").alter();
    table.text("nip").alter();
    table.text("nama").alter();
    table.text("instansi_nama").alter();
    table.text("jenis_layanan_nama").alter();
    table.text("no_surat_keluar").alter();
    table.text("tgl_surat_keluar").alter();
    table.text("path_pertek").alter();
    table.text("path_ttd_pertek").alter();
    table.text("path_surat_usulan").alter();
    table.text("pejabat_paraf_id").alter();
    table.text("pejabat_ttd_id").alter();
    table.text("uraian_perbaikan").alter();
    table.text("uraian_pembatalan").alter();
    table.text("nama_tabel_riwayat").alter();
    table.text("id_riwayat_update").alter();
    table.text("no_sk").alter();
    table.text("path_paraf_sk").alter();
    table.text("pejabat_paraf_sk").alter();
    table.text("status_paraf_sk").alter();
    table.text("tgl_paraf_sk").alter();
    table.text("path_ttd_sk").alter();
    table.text("pejabat_ttd_sk").alter();
    table.text("tgl_ttd_sk").alter();
    table.text("status_ttd_sk").alter();
    table.text("no_pertek").alter();
    table.text("referensi_instansi").alter();
    table.text("tgl_sk").alter();
    table.text("tgl_pertek").alter();
    table.text("alasan_tolak_id").alter();
    table.text("alasan_tolak_tambahan").alter();
    table.text("generated_nomor").alter();
    table.text("periode").alter();
    table.text("jenis_formasi_id").alter();
    table.text("jenis_formasi_nama").alter();
    table.text("jenis_pegawai_id").alter();
    table.text("status_kerja_induk_id").alter();
    table.text("satuan_kerja_induk_nama").alter();
    table.text("instansi_induk_id").alter();
    table.text("instansi_induk_nama").alter();
    table.text("tgl_kontrak_mulai").alter();
    table.text("tgl_kontrak_akhir").alter();
    table.text("no_urut").alter();
    table.text("nip_approval").alter();
    table.text("path_dokumen_pembatalan").alter();
    table.text("tahun_formasi").alter();
    table.text("flag_otomatisasi").alter();
    table.text("dokumen_baru").alter();
    table.text("dokumen_lama").alter();
    table.text("flag_perbaikan_dokumen").alter();
    table.text("satuan_kerja_induk_id").alter();
    table.text("status_ttd_paraf_pertek").alter();
    table.text("tgl_surat_usulan").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pengadaan_proxy", (table) => {
    table.string("orang_id").alter();
    table.string("status_usulan").alter();
    table.string("dokumen_usulan").alter();
    table.string("tgl_usulan").alter();
    table.string("tgl_pengiriman_kelayanan").alter();
    table.string("tgl_update_layanan").alter();
    table.string("instansi_id").alter();
    table.string("keterangan").alter();
    table.string("status_aktif").alter();
    table.string("no_surat_usulan").alter();
    table.string("status_paraf_pertek").alter();
    table.string("provinsi_nama").alter();
    table.string("nip").alter();
    table.string("nama").alter();
    table.string("instansi_nama").alter();
    table.string("jenis_layanan_nama").alter();
    table.string("no_surat_keluar").alter();
    table.string("tgl_surat_keluar").alter();
    table.string("path_pertek").alter();
    table.string("path_ttd_pertek").alter();
    table.string("path_surat_usulan").alter();
    table.string("pejabat_paraf_id").alter();
    table.string("pejabat_ttd_id").alter();
    table.string("uraian_perbaikan").alter();
    table.string("uraian_pembatalan").alter();
    table.string("nama_tabel_riwayat").alter();
    table.string("id_riwayat_update").alter();
    table.string("no_sk").alter();
    table.string("path_paraf_sk").alter();
    table.string("pejabat_paraf_sk").alter();
    table.string("status_paraf_sk").alter();
    table.string("tgl_paraf_sk").alter();
    table.string("path_ttd_sk").alter();
    table.string("pejabat_ttd_sk").alter();
    table.string("tgl_ttd_sk").alter();
    table.string("status_ttd_sk").alter();
    table.string("no_pertek").alter();
    table.string("referensi_instansi").alter();
    table.string("tgl_sk").alter();
    table.string("tgl_pertek").alter();
    table.string("alasan_tolak_id").alter();
    table.string("alasan_tolak_tambahan").alter();
    table.string("generated_nomor").alter();
    table.string("periode").alter();
    table.string("jenis_formasi_id").alter();
    table.string("jenis_formasi_nama").alter();
    table.string("jenis_pegawai_id").alter();
    table.string("status_kerja_induk_id").alter();
    table.string("satuan_kerja_induk_nama").alter();
    table.string("instansi_induk_id").alter();
    table.string("instansi_induk_nama").alter();
    table.string("tgl_kontrak_mulai").alter();
    table.string("tgl_kontrak_akhir").alter();
    table.string("no_urut").alter();
    table.string("nip_approval").alter();
    table.string("path_dokumen_pembatalan").alter();
    table.string("tahun_formasi").alter();
    table.string("flag_otomatisasi").alter();
    table.string("dokumen_baru").alter();
    table.string("dokumen_lama").alter();
    table.string("flag_perbaikan_dokumen").alter();
    table.string("satuan_kerja_induk_id").alter();
    table.string("status_ttd_paraf_pertek").alter();
    table.string("tgl_surat_usulan").alter();
  });
};
