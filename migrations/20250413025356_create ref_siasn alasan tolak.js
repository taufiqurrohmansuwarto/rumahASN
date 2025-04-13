/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_siasn")
    .createTable("alasan_tolak", function (table) {
      table.string("id").primary();
      table.string("layanan_id");
      table.string("alasan");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("alasan_tolak");
};
