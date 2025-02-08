/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rekon")
    .createTable("jenis_jabatan", (table) => {
      table.increments("id").primary();
      table.string("id_siasn");
      table.string("id_simaster");
      table.string("user_id");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
