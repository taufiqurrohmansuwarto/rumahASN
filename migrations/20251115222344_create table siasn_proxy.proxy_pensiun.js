exports.up = function (knex) {
  return knex.schema
    .withSchema("siasn_proxy")
    .createTable("proxy_pensiun", (table) => {
      // Primary key
      table.string("id").primary();

      // Layanan information
      table.integer("layanan_id");
      table.string("layanan_nama");
      table.integer("sub_layanan_id");
      table.string("sub_layanan_nama");
      table.integer("detail_layanan_id");
      table.string("detail_layanan_nama");

      // PNS information
      table.string("pns_id");
      table.string("nip");
      table.string("nama");
      table.string("instansi_id");
      table.string("instansi_nama");

      // JSON data
      table.jsonb("usulan_data");
      table.jsonb("dokumen_usulan");

      // Jenis henti
      table.string("jenis_henti_id");
      table.string("jenis_henti_nama");

      // Status
      table.integer("status_aktif");
      table.integer("status_usulan");

      // Dates
      table.timestamp("tgl_usulan");

      // Created by information
      table.string("created_by");
      table.string("created_by_nip");
      table.string("created_by_nama");

      // Approval information
      table.timestamp("approval_tgl");
      table.string("approval_id");
      table.string("approval_nip");
      table.string("approval_nama");

      // Document paths (using text for long paths)
      table.text("path_pertek");
      table.text("path_pertek_multi");
      table.text("path_sk_multi");
      table.text("path_sk");
      table.text("path_sk_preview");

      // Additional dates
      table.timestamp("kirim_teken_usul_tgl");
      table.timestamp("tgl_pengiriman_kelayanan");
      table.timestamp("updated_from_bkn_at");

      // Alasan tolak
      table.string("alasan_tolak_id");
      table.text("alasan_tolak_tambahan");

      // Notes
      table.text("notes");

      // Update tracking
      table.timestamp("updated_at");
      table.string("deleted_by");

      // SK information
      table.string("sk_nomor");
      table.timestamp("sk_tgl");
      table.text("keterangan");
      table.string("sk_signer_id");
      table.string("sk_signer_nama");
      table.string("sk_signer_nip");

      // Taspen data
      table.jsonb("usulan_taspen");
    });
};

exports.down = function (knex) {
  return knex.schema.withSchema("siasn_proxy").dropTable("proxy_pensiun");
};
