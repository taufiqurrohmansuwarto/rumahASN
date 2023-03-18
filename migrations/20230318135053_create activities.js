/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("activities", (table) => {
    table.increments("id").primary();
    table.string("name");
    table.string("description");
    table.string("type");
    table.string("sender");
    table.string("receiver");
    table.foreign("sender").references("users.custom_id");
    table.foreign("receiver").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("activities");
};
