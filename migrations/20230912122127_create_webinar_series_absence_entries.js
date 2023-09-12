/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "webinar_series_absence_entries",
    function (table) {
      table.string("id").primary();
      table.string("webinar_series_id");
      table.integer("day");
      table.dateTime("registration_open_at");
      table.dateTime("registration_close_at");

      table
        .foreign("webinar_series_id")
        .references("webinar_series.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.timestamps(true, true);
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("webinar_series_absence_entries");
};
