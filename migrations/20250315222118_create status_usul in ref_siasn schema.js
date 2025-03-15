/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_siasn")
    .createTable("status_usul", function (table) {
      table.string("id").primary();
      table.string("nama");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("status_usul");
};
