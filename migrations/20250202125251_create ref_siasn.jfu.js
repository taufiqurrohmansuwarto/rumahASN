/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("ref_siasn").createTable("jfu", (table) => {
    table.string("id").primary();
    table.string("nama");
    table.string("cepat_kode");
    table.string("status");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("jfu");
};
