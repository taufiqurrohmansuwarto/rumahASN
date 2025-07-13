/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_token", function (table) {
    table.increments("id").primary();
    table.jsonb("token").notNullable();
    table.string("user_id").references("custom_id").inTable("users");
    table.unique("user_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_token");
};
