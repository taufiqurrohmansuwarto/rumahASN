/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log_bsre", (table) => {
    table.increments("id").primary();
    table.string("user_id");
    table.jsonb("log");
    table.string("webinar_series_participate_id");

    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onDelete("CASCADE");
    table
      .foreign("webinar_series_participate_id")
      .references("webinar_series_participates.id")
      .onDelete("CASCADE")
      .onDelete("CASCADE");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
