/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "webinar_series_participates",
    function (table) {
      table.string("id").primary();
      table.string("webinar_series_id").unsigned().notNullable();
      table.string("user_id").unsigned().notNullable();
      table.string("document_id");
      table.string("certificate_number");
      table.boolean("already_poll").defaultTo(false);
      table.boolean("is_registered").defaultTo(true);
      table.timestamps(true, true);
      table.unique(["webinar_series_id", "user_id"]);
      table
        .foreign("webinar_series_id")
        .references("webinar_series.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .foreign("user_id")
        .references("users.custom_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("webinar_series_participates");
};
