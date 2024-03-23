/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("submissions_pics", function (table) {
    table.string("id").primary();
    table.jsonb("organization");
    table.string("submissions_id");
    table
      .foreign("submissions_id")
      .references("submissions_references.id")
      .onDelete("CASCADE")
      .onDelete("CASCADE");
    table.specificType("organization_id", "text ARRAY");
    table.string("user_id");
    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("submissions_pics");
};
