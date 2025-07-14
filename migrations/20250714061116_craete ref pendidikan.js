/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.then(() => {
    return knex.schema
      .withSchema("ref_siasn")
      .createTable("pendidikan", (table) => {
        table.text("id").primary();
        table.string("tk_pendidikan_id");
        table.text("nama");
        table.string("status");
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`DROP SCHEMA IF EXISTS ref_pendidikan`);
};
