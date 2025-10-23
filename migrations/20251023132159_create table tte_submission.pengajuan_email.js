/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("tte_submission")
    .createTable("pengajuan_email", (table) => {
      table.string("id").primary();
      table
        .string("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");
      table.string("nip");
      table.string("no_hp");
      table.string("email_usulan");

      //  status pengajuan
      table.string("status");
      table.text("catatan");

      // tracking
      table.timestamp("tanggal_ajuan");
      table.timestamp("tanggal_diproses");

      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("tte_submission").dropTable("pengajuan_email");
};
