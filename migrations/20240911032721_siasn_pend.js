/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_pend", function (table) {
    table.string("id").primary();
    table.integer("tk_pendidikan");
    table
      .foreign("tk_pendidikan")
      .references("id")
      .inTable("siasn_tk_pend")
      .onDelete("cascade")
      .onUpdate("cascade");
    table.string("nama");
    table.integer("status");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_pend");
};
