/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("disparitas_unor", (table) => {
    table.string("id").primary();
    table.boolean("unor_sekolah").defaultTo(false);
    table.boolean("duplikasi_unor").defaultTo(false);
    table.boolean("aktif").defaultTo(false);
    table.string("NSPN");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
