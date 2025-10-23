/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("tte_submission")
    .createTable("log_perbaikan", (table) => {
      table.string("id").primary();
      table
        .string("pengajuan_id")
        .references("id")
        .inTable("tte_submission.pengajuan_tte")
        .onDelete("CASCADE");
      table.timestamp("tanggal_perbaikan");
      table.text("keterangan");
      table
        .string("diperbaiki_oleh")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("tte_submission").dropTable("log_perbaikan");
};
