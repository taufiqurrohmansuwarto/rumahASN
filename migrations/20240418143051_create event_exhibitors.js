/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("event_exhibitors", (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
    table.string("event_id");
    table
      .foreign("event_id")
      .references("events.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("exhibitor_name");
    table.string("exhibitor_logo_url");
    table.text("exhibitor_description");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
