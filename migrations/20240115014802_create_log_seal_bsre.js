/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log_seal_bsre", function (table) {
    table.increments("id").primary();
    table.string("user_id");
    table
      .foreign("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("action");
    table.string("status");
    table.string("error_code");
    table.text("request_data");
    table.text("response_data");
    table.text("description");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("log_seal_bsre");
};
