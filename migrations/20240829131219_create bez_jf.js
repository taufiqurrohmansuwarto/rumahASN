/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bez_jf", function (table) {
    table.string("kode").primary();
    table.string("nama_jabatan");
    table.string("instansi_pembina_jf");
    table.integer("abk").defaultTo(0);
    table.integer("rekom_instansi_pembina").defaultTo(0);
    table.integer("jml_penetapan_panrb").defaultTo(0);
    table.integer("impassing").defaultTo(0);
    table.integer("bez_saat_ini").defaultTo;
    table.integer("kelebihan_kekurangan").defaultTo(0);
    table.text("keterangan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("bez_jf");
};
