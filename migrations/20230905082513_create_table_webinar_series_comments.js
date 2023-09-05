/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("webinar_series_comments", function (table) {
    table.string("id").primary();
    table.string("webinar_series_id");
    table.string("user_id");
    table.string("comment");
    table.boolean("is_edited").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.timestamp("deleted_at");

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
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("webinar_series_comments");
};
