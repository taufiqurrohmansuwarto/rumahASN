/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bez_jf_jenjang", (table) => {
    table.increments("id").primary();
    table.string("kode");
    table.string("jenjang_jabatan");
    table.unique(["kode", "jenjang_jabatan"]);
    table.foreign("kode").references("kode").inTable("bez_jf");
    table.integer("abk").defaultTo(0);
    table.integer("rekom_instansi_pembina").defaultTo(0);
    table.integer("jml_penetapan_panrb").defaultTo(0);
    table.integer("impassing").defaultTo(0);
    table.integer("kelebihan_kekurangan").defaultTo(0);
    table.text("keterangan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("bez_jf_jenjang");
};
