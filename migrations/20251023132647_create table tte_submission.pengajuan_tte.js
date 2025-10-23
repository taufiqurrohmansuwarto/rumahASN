/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("tte_submission")
    .createTable("pengajuan_tte", (table) => {
      table.string("id").primary();
      table.string("nip");
      table.string("nik");
      table.string("email_jatimprov");
      table
        .string("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      // dokumen persyaratan
      table.string("file_ktp");
      table.string("file_sk_pangkat");
      table.string("file_surat_usulan");

      // status
      table.string("status");
      table.text("catatan");

      // tracking
      table.timestamp("tanggal_ajuan");
      table.timestamp("tanggal_diproses");
      table
        .string("diproses_oleh")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("tte_submission").dropTable("pengajuan_tte");
};
