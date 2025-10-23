/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("tte_submission")
    .createTable("email_pegawai", (table) => {
      table.increments("id").primary();
      table.string("nip");
      table.string("email_jatimprov");
      table.string("no_hp");
      table.datetime("tanggal_buat");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("tte_submission").dropTable("email_pegawai");
};
