/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`CREATE SCHEMA IF NOT EXISTS "pengadaan"`).then(() => {
    return knex.schema
      .withSchema("pengadaan")
      .createTable("paruh_waktu", (table) => {
        // Primary Key
        table.string("id").primary();

        // Foreign Keys & References
        table.string("orang_id");
        table.string("instansi_id");
        table.string("instansi_induk_id");
        table.string("satuan_kerja_id");
        table.string("satuan_kerja_induk_id");

        // Status & Tracking
        table.string("status_usulan");
        table.string("status_usulan_nama");
        table.string("status_usulan_id");
        table.string("status_aktif").defaultTo("1");
        table.string("keterangan");

        // Data Pegawai
        table.string("nip").unique();
        table.string("nama");
        table.string("tempat_lahir");
        table.string("tgl_lahir");
        table.string("glr_depan");
        table.string("glr_belakang");
        table.string("no_peserta");

        // Data Pendidikan (dari usulan_data.data)
        table.string("nama_sek");
        table.string("tk_pendidikan_id");
        table.string("pendidikan_ijazah_id");
        table.string("pendidikan_ijazah_nama");
        table.string("pendidikan_pertama_id");
        table.string("pendidikan_pertama_nama");
        table.string("nomor_ijazah");
        table.string("tahun_lulus");
        table.string("tgl_tahun_lulus");

        // Data Kepegawaian (dari usulan_data.data)
        table.string("tmt_cpns");
        table.string("golongan_id");
        table.string("golongan_nama");
        table.string("gaji_pokok");
        table.string("tahun_gaji");

        // Data Jabatan (dari usulan_data.data)
        table.string("jenis_jabatan_id");
        table.string("jenis_jabatan_nama");
        table.string("jabatan_fungsional_id");
        table.string("jabatan_fungsional_nama");
        table.string("jabatan_fungsional_umum_id");
        table.string("jabatan_fungsional_umum_nama");
        table.string("sub_jabatan_fungsional_id");
        table.string("sub_jabatan_fungsional_nama");
        table.string("jabatan_struktural_nama");

        // Unit Organisasi (dari usulan_data.data)
        table.string("unor_id");
        table.string("unor_nama");
        table.string("unor_induk");
        table.string("unor_induk_nama");
        table.string("unor_siasn");
        table.string("unor_simaster");
        table.string("unor_siasn_id");
        table.string("unor_simaster_id");
        table.string("unor_baru"); // Kolom tambahan yang diminta

        // Lokasi & Wilayah (dari usulan_data.data)
        table.string("lokasi_id");
        table.string("lokasi_nama");
        table.string("kanreg_id");
        table.string("kanreg_nama");
        table.string("kpkn_id");
        table.string("kpkn_nama");
        table.string("provinsi_nama");

        // Instansi (dari usulan_data.data + root)
        table.string("instansi_nama");
        table.string("instansi_induk_nama");
        table.string("instansi_kerja_id");
        table.string("instansi_kerja_nama");
        table.string("satuan_kerja_nama");
        table.string("satuan_kerja_induk_nama");

        // Masa Kerja (dari usulan_data.data)
        table.string("jenis_masa_kerja");
        table.string("masa_kerja_tahun");
        table.string("masa_kerja_bulan");
        table.string("masa_kerja_tahun_pmk");
        table.string("masa_kerja_bulan_pmk");
        table.string("tahun_masa_kerja");
        table.string("instansi_masa_kerja");
        table.string("tgl_awal_masa_kerja");
        table.string("tgl_akhir_masa_kerja");

        // Formasi (dari usulan_data.data)
        table.string("formasi_isi");
        table.string("formasi_sisa");
        table.string("formasi_lebih");
        table.string("formasi_jumlah");
        table.string("jenis_formasi_id");
        table.string("jenis_formasi_nama");
        table.string("jenis_pegawai_id");
        table.string("tahun_formasi");

        // Kontrak (dari usulan_data.data)
        table.string("tgl_kontrak_mulai");
        table.string("tgl_kontrak_akhir");

        // Surat Keterangan (dari usulan_data.data)
        table.string("ket_sehat_nomor");
        table.string("ket_sehat_dokter");
        table.string("ket_sehat_tanggal");
        table.string("ket_kelakuanbaik_nomor");
        table.string("ket_kelakuanbaik_pejabat");
        table.string("ket_kelakuanbaik_tanggal");
        table.string("ket_bebas_narkoba_nomor");
        table.string("ket_bebas_narkoba_pejabat");
        table.string("ket_bebas_narkoba_tanggal");

        // Dokumen usulan (jsonb) - tetap jsonb
        table.jsonb("dokumen_usulan");

        // Tanggal (string format)
        table.string("tgl_usulan");
        table.string("tgl_pengiriman_kelayanan");
        table.string("tgl_update_layanan");
        table.string("tgl_surat_usulan");
        table.string("tgl_surat_keluar");
        table.string("tgl_sk");
        table.string("tgl_pertek");
        table.string("tgl_paraf_sk");
        table.string("tgl_ttd_sk");

        // Surat & Nomor
        table.string("no_surat_usulan");
        table.string("no_surat_keluar");
        table.string("no_sk");
        table.string("no_pertek");

        // Path dokumen
        table.string("path_surat_usulan");
        table.string("path_pertek");
        table.string("path_ttd_pertek");
        table.string("path_paraf_sk");
        table.string("path_ttd_sk");
        table.string("path_dokumen_pembatalan");

        // Pejabat
        table.string("pejabat_paraf_id");
        table.string("pejabat_ttd_id");
        table.string("pejabat_paraf_sk");
        table.string("pejabat_ttd_sk");
        table.string("nip_approval");

        // Status tambahan
        table.string("status_paraf_pertek");
        table.string("status_ttd_paraf_pertek");
        table.string("status_paraf_sk");
        table.string("status_ttd_sk");
        table.string("download_status");
        table.string("sk_diunduh");
        table.string("pertek_diunduh");

        // Layanan
        table.string("jenis_layanan_nama");

        // Perbaikan & Pembatalan
        table.string("uraian_perbaikan");
        table.string("uraian_pembatalan");
        table.string("alasan_tolak_id");
        table.string("alasan_tolak_tambahan");

        // Riwayat
        table.string("nama_tabel_riwayat");
        table.string("id_riwayat_update");

        // Flags
        table.string("generated_nomor").defaultTo("false");
        table.string("flag_otomatisasi").defaultTo("0");
        table.string("flag_perbaikan_dokumen");
        table.string("dokumen_baru");
        table.string("dokumen_lama");

        // Additional
        table.string("periode");
        table.string("no_urut");
        table.string("referensi_instansi");
        table.string("status_kerja_induk_id");

        /// kolom tambahan untuk menampung unor siasn dan simaster
        table.string("unor_id_siasn");
        table.string("unor_id_simaster");

        // Kolom Gaji Tambahan (string untuk menampung 9+ digit)
        table.bigInteger("gaji");

        // Timestamps
        table.string("created_at");
        table.string("updated_at");
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`DROP TABLE IF EXISTS pengadaan.paruh_waktu`);
};
