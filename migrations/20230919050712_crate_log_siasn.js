/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log_siasn", function (table) {
    table.increments().primary();
    table.string("user_id");
    table.string("type");
    table.string("siasn_service");

    table.foreign("user_id").references("custom_id").inTable("users");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("log_siasn");
};
