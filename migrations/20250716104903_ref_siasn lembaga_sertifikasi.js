/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_siasn")
    .createTable("lembaga_sertifikasi", (table) => {
      table.text("id").primary();
      table.text("nama");
      table.text("status");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("lembaga_sertifikasi");
};
