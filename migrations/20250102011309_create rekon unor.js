/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`CREATE SCHEMA IF NOT EXISTS rekon`).then(() => {
    return knex.schema.withSchema("rekon").createTable("unor", (table) => {
      table.string("id").primary();
      table.string("id_siasn");
      table.string("id_simaster");
      table.string("user_id");
      table
        .foreign("user_id")
        .references("users.custom_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.timestamps(true, true);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
