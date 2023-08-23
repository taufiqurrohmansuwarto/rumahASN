/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "webinar_series_participates",
    function (table) {
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

      table.string("status").defaultTo("registered");
      table.boolean("already_polling").defaultTo(false);

      table.primary(["webinar_series_id", "user_id"]);

      table.timestamps(true, true);
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
