/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("submissions_references", function (table) {
    table.string("id").primary();
    table.string("type");
    table.text("description");
    table.text("submitter_type");
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id").onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("submissions_references");
};
