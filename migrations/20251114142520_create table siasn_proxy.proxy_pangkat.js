/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("siasn_proxy")
    .createTable("proxy_pangkat", (table) => {
      // Primary Key
      table.string("id").primary();

      // Layanan Info
      table.integer("jenis_layanan");
      table.integer("sub_layanan");
      table.integer("detail_layanan");
      table.string("detail_layanan_nama");
      table.string("jenis_layanan_nama");

      // PNS Info
      table.string("pns_id");
      table.string("nip");
      table.string("nama");

      // JSONB Data
      table.jsonb("usulan_data");
      table.jsonb("dokumen_usulan");

      // Status
      table.integer("status_usulan");
      table.integer("status_aktif");
      table.integer("status_paraf_pertek");
      table.integer("status_ttd_paraf_pertek");
      table.string("status_paraf_sk");
      table.string("status_ttd_sk");

      // Tanggal
      table.string("tgl_usulan");
      table.string("tgl_pengiriman_kelayanan");
      table.string("tgl_update_layanan");
      table.string("tgl_surat_usulan");
      table.string("tgl_surat_keluar");
      table.string("tgl_paraf_sk");
      table.string("tgl_ttd_sk");
      table.string("tgl_sk");
      table.string("tgl_pertek");
      table.string("periode");

      // Instansi
      table.string("instansi_id");
      table.string("instansi_nama");
      table.string("instansi_induk_id");
      table.string("instansi_induk_nama");
      table.string("satuan_kerja_induk_id");
      table.string("satuan_kerja_induk_nama");
      table.string("provinsi_nama");

      // Dokumen Paths
      table.text("path_pertek");
      table.text("path_ttd_pertek");
      table.text("path_surat_usulan");
      table.text("path_paraf_sk");
      table.text("path_ttd_sk");
      table.text("path_sk");
      table.text("path_sk_kolektif");
      table.text("path_sk_lampiran");

      // Pejabat
      table.string("pejabat_paraf_id");
      table.string("pejabat_ttd_id");
      table.string("pejabat_paraf_sk");
      table.string("pejabat_ttd_sk");

      // Surat & Nomor
      table.string("no_surat_usulan");
      table.string("no_surat_keluar");
      table.string("no_sk");
      table.string("no_urut");
      table.string("no_pertek");

      // Kenaikan Pangkat Specific
      table.string("jenis_kp_id");
      table.string("jenis_pegawai_id");

      // Uraian & Keterangan
      table.text("keterangan");
      table.text("uraian_perbaikan");
      table.text("uraian_pembatalan");

      // Riwayat
      table.string("nama_tabel_riwayat");
      table.string("id_riwayat_update");

      // Alasan Tolak
      table.integer("alasan_tolak_id");
      table.text("alasan_tolak_tambahan");

      // Referensi
      table.integer("referensi_instansi");

      // Flags & Counters
      table.boolean("generated_nomor");
      table.string("is_otomatis");
      table.integer("counter_bts");

      // Approval & Pengusul
      table.string("nip_pengaju");
      table.string("nip_approval");
      table.string("nama_approval");
      table.string("nip_approval_perbaikan");
      table.string("pns_id_pengusul");
      table.string("kanreg_id_pengusul");

      // Additional Status
      table.string("StatusData");

      // Timestamps
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("siasn_proxy").dropTable("proxy_pangkat");
};
