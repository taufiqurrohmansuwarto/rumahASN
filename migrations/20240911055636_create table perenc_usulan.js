/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("perenc_usulan", function (table) {
    table.increments("id").primary();
    table.string("judul");
    table.string("deskripsi");
    table.string("tahun");
    table.string("user_id");
    table.foreign("user_id").references("custom_id").inTable("users");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("perenc_usulan");
};
