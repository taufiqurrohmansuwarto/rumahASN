exports.up = function (knex) {
  return knex.schema
    .withSchema("siasn_proxy")
    .createTable("proxy_skk", (table) => {
      // Primary key
      table.string("id").primary();

      // Jenis layanan
      table.integer("jenis_layanan");
      table.integer("sub_layanan");
      table.integer("detail_layanan");
      table.string("jenis_layanan_nama");

      // Surat usulan
      table.string("no_surat_usulan");
      table.timestamp("tgl_surat_usulan");
      table.text("path_surat_usulan");

      // PNS information
      table.string("pns_id");
      table.string("nip");
      table.string("nama");

      // Instansi information
      table.string("instansi_id");
      table.string("instansi_nama");
      table.string("provinsi_nama");

      // JSON data
      table.jsonb("usulan_data");
      table.jsonb("dokumen_usulan");

      // Status
      table.integer("status_usulan");
      table.timestamp("tgl_usulan");
      table.text("message");
      table.string("deleted_at");

      // SK information
      table.string("no_sk");
      table.timestamp("tgl_sk");
      table.string("pejabat_ttd_sk");
      table.string("typeSignature");
      table.string("nama_waris");
      table.string("tempat_ditetapkan");
      table.string("jabatan_ttd");

      // Status CPNS/PNS
      table.string("status_cpns_pns");
      table.string("pangkat_gol");
      table.string("masa_kerja_gol");
      table.timestamp("mulai_tgl");

      // Timestamps
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.withSchema("siasn_proxy").dropTable("proxy_skk");
};
