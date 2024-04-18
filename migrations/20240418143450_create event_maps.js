/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("event_maps", (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
    table.string("event_id");
    table
      .foreign("event_id")
      .references("events.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("map_url");
    table.text("description");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("event_maps");
};
