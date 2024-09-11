/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("simaster_jfu", function (table) {
    table.string("id").primary();
    table.string("pId");
    table.string("name");
    table.string("jenjang_id");
    table.string("kualifikasi_id");
    table.string("url");
    table.string("open");
    table.enum("aktif", ["Y", "N"]);
    table.integer("kelas_jab");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("simaster_jfu");
};
