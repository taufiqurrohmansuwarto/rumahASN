const { kebabCase } = require("lodash");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_siasn")
    .createTable("rumpun_jabatan", (table) => {
      table.text("cepat").primary();
      table.text("nama");
      table.text("cepat_kode");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_siasn").dropTable("rumpun_jabatan");
};
