/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.dropTable("podcasts");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.createTable("podcasts", function (table) {
    table.increments("id").primary();
    table.string("title");
    table.string("description");
    table.string("image");
    table.string("audio");
    table.string("author");
    table.string("category");
    table.string("tags");
    table.string("slug");
    table.timestamps(true, true);
  });
};
