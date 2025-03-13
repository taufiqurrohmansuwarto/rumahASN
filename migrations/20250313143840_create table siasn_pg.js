/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_pg", (table) => {
    // Gunakan tipe UUID (atau string) sebagai primary key
    table.string("id").primary();

    // Contoh kolom-kolom string
    table.string("nama", 255).notNullable();
    table.string("detail_layanan", 50).nullable();
    table.string("jenis_layanan_nama", 255).nullable();
    table.string("unor_pengusul_id", 50).nullable();
    table.string("unor_verifikator_id", 50).nullable();
    table.string("unor_verifikator_nama", 255).nullable();
    table.string("status_usulan", 50).nullable();
    table.string("status_usulan_nama", 255).nullable();
    table.string("sumber", 255).nullable();

    // Contoh kolom waktu
    table.timestamp("tgl_usulan", { useTz: true }).nullable();

    // Kolom JSONB
    table.jsonb("usulan_data").nullable();
    table.jsonb("dokumen_usulan").nullable();

    // Kolom tambahan lain
    table.string("id_riwayat_update", 50).nullable();
    table.string("id_riwayat", 50).nullable();
    table.string("alasan_tolak", 255).nullable();
    table.string("alasan_tolak_tambahan", 255).nullable();
    table.string("pns_id", 50).nullable();
    table.string("unor_approval", 255).nullable();
    table.timestamp("tmt_cpns", { useTz: true }).nullable();
    table.string("instansi_id", 50).nullable();
    table.string("nomenklatur", 255).nullable();
    table.string("gol_tolak_bkn", 255).nullable();
    table.timestamp("tgl_tolak_bkn", { useTz: true }).nullable();
    table.string("no_surat_usulan", 255).nullable();
    table.timestamp("tgl_surat_usulan", { useTz: true }).nullable();
    table.string("no_surat_approval", 255).nullable();
    table.timestamp("tgl_surat_approval", { useTz: true }).nullable();
    table.string("unor_approval_nama", 255).nullable();

    // Timestamp untuk created_at & updated_at (opsional)
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_pg");
};
