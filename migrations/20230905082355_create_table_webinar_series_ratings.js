/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("webinar_series_ratings", function (table) {
    table.string("id").primary();
    table.string("webinar_series_id");
    table.string("user_id");
    table.integer("rating");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table
      .foreign("webinar_series_id")
      .references("webinar_series.id")
      .onDelete("cascade")
      .onUpdate("cascade");
    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("cascade")
      .onUpdate("cascade");
    table.unique(["webinar_series_id", "user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("webinar_series_ratings");
};
