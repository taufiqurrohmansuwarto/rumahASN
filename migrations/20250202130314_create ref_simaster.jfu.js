/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS ref_simaster`)
    .then(() => {
      return knex.schema
        .withSchema("ref_simaster")
        .createTable("jfu", (table) => {
          // "id","pId","name","jenjang_id","kualifikasi_id","url","open","aktif","kelas_jab"
          table.string("id").primary();
          table.string("pId");
          table.string("name");
          table.string("jenjang_id");
          table.string("kualifikasi_id");
          table.string("url");
          table.string("open");
          table.string("aktif");
          table.string("kelas_jab");
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("ref_simaster").dropTable("jfu");
};
