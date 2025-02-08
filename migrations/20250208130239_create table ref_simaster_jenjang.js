/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("ref_simaster")
    .createTable("jenjang", (table) => {
      table.string("jenjang_id").primary();
      table.string("jenjang_pendidikan");
      table.string("kode_bkn");
      table.string("kode_kemendagri");
      table.string("user_id");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_simaster").dropTable("jenjang");
};
