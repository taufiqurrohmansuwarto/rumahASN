/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("speakers", (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
    table.string("name");
    table.text("bio");
    table.string("photo_url");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("speakers");
};
