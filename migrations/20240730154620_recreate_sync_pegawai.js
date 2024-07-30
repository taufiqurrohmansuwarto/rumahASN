/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("sync_pegawai", (table) => {
    table.bigInteger("id").primary();
    table.string("foto");
    table.string("jabatan_asn");
    table.string("skpd_id");
    table.string("nama_master");
    table.string("nip_master");
    table.string("opd_master");
    table.string("email_master");
    table.string("tgl_lahir_master");
    table.string("gelar_depan_master");
    table.string("gelar_belakang_master");
    table.string("jenjang_master");
    table.string("prodi_master");
    table.string("golongan_master");
    table.string("pangkat_master");
    table.string("jenis_jabatan");
    table.string("jabatan_master");
    table.string("status_master");
    table.integer("kode_golongan_bkn");
    table.integer("kode_jenis_jabatan_bkn");
    table.integer("kode_jenjang_master");
    table.integer("kelas_jabatan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
