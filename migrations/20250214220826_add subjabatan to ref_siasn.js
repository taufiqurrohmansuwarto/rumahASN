/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_siasn")
    .createTable("sub_jabatan", (table) => {
      table.string("id").primary();
      table.string("kel_jabatan_id");
      table.string("nama");
      table.string("status_aktif");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("sub_jabatan");
};
