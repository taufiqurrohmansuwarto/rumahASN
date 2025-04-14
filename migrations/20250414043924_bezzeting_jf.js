/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bezzeting_jf", function (table) {
    table.increments("id").primary();
    table.string("jf_id");
    table.string("sub_jabatan_id");
    table.string("sub_jabatan_nama");
    table.integer("rekom");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("bezzeting_jf");
};
