/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("rekon").createTable("skp", (table) => {
    table.increments("id").primary();
    table.string("nip");
    table.string("tahun");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rekon").dropTable("skp");
};
