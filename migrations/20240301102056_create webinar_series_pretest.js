/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("webinar_series_pretests", function (table) {
    table.string("id").primary();
    table.jsonb("questions");
    table
      .string("webinar_series_id")
      .references("id")
      .inTable("webinar_series")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .string("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("webinar_series_pretests");
};
