/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("sinkronisasi", (table) => {
    table.increments("id").primary();
    table.string("aplikasi");
    table.string("layanan");
    table.unique(["aplikasi", "layanan"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("sinkronisasi");
};
