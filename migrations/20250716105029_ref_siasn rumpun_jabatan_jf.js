const { kebabCase } = require("lodash");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_siasn")
    .createTable("rumpun_jabatan_jf", (table) => {
      table.text("id").primary();
      table.text("nama");
      table.text("kode_rumpun");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("rumpun_jabatan_jf");
};
