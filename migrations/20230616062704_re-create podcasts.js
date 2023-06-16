/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("podcasts", function (table) {
    table.string("id").primary();
    table.string("title");
    table.string("description");
    table.string("image_url");
    table.string("audio_url");
    table.string("author");
    table.foreign("author").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("podcasts");
};
