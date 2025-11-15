exports.up = function (knex) {
  return knex.schema
    .withSchema("siasn_proxy")
    .createTable("proxy_pg_akademik", (table) => {
      // Primary key
      table.string("id").primary();

      // PNS information
      table.string("nama");
      table.string("nip");
      table.string("pns_id");
      table.string("tipe_pegawai");

      // Layanan information
      table.string("detail_layanan");
      table.string("detail_layanan_nama");
      table.string("jenis_layanan_nama");
      table.string("sub_layanan");

      // Verifikator information
      table.string("unor_verifikator");
      table.string("unor_verifikator_nama");
      table.string("nip_verifikator");
      table.string("nama_verifikator");

      // Status
      table.integer("status_usulan");
      table.string("status_usulan_nama");
      table.string("sumber");

      // Dates
      table.timestamp("tgl_usulan");
      table.timestamp("tmt_cpns");
      table.timestamp("tgl_tolak_bkn");

      // JSON data
      table.jsonb("usulan_data");
      table.jsonb("dokumen_usulan");

      // Riwayat
      table.string("id_riwayat_update");
      table.string("id_riwayat");

      // Tipe
      table.string("tipe_usulan");
      table.string("tipe");

      // Alasan tolak
      table.integer("alasan_tolak_id");
      table.string("alasan_tolak_nama");
      table.text("alasan_tolak_tambahan");

      // Approval information
      table.integer("rekomendasi_approval");
      table.string("pns_id_approval");
      table.string("nip_approval");
      table.string("nama_approval");
      table.string("unor_approval_id");
      table.string("unor_approval_nama");

      // Instansi information
      table.string("instansi_id");
      table.string("instansi_nama");
      table.string("kanreg_id");

      // Periode
      table.string("periode");
      table.string("periode_id");
    });
};

exports.down = function (knex) {
  return knex.schema.withSchema("siasn_proxy").dropTable("proxy_pg_akademik");
};
