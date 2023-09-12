/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "webinar_series_participants_absence",
    function (table) {
      table.string("id").primary();
      table.string("webinar_series_absence_entry_id");
      table.string("user_id");
      table.boolean("attended").defaultTo(false);

      table
        .foreign("user_id")
        .references("users.custom_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table
        .foreign("webinar_series_absence_entry_id")
        .references("webinar_series_absence_entries.id")
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
  return knex.schema.dropTable("webinar_series_participants_absence");
};
