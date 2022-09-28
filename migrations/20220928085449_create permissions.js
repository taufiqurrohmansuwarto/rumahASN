/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("permissions", function (table) {
    table.increments("id").primary();
    table.string("action").notNullable();
    table.string("subject").notNullable();
    table.json("conditions");
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("permissions");
};
