/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_pg", (table) => {
    table.string("id").primary();
    table.string("nama", 255).notNullable();
    table.string("detail_layanan", 50).nullable();
    table.string("nip", 255).nullable();
    table.string("tipe_pegawai");
    table.string("unor_verifikator");
    table.string("unor_verifikator_nama");
    table.string("status_usulan");
    table.string("status_usulan_nama");
    table.string("sumber");
    table.timestamp("tgl_usulan", { useTz: true });
    table.jsonb("usulan_data");
    table.jsonb("dokumen_usulan");
    table.string("id_riwayat_update");
    table.string("id_riwayat");
    table.string("tipe_usulan");
    table.string("tipe");
    table.string("alasan_tolak_tambahan");
    table.string("alasan_tolak_id");
    table.string("alasan_tolak_nama");
    table.string("pns_id");
    table.string("rekomendasi_approval");
    table.string("nip_verifikator");
    table.string("nama_verifikator");
    table.timestamp("tmt_cpns", { useTz: true });
    table.string("instansi_id");
    table.string("instansi_nama");
    table.string("kanreg_id");
    table.string("periode");
    table.string("tgl_tolak_bkn");
    table.string("pns_id_approval");
    table.string("nip_approval");
    table.string("nama_approval");
    table.string("unor_approval_id");
    table.string("unor_approval_nama");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_pg");
};
