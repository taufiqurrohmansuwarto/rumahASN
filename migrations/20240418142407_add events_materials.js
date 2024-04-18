/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("events_materials", (table) => {
    table.string("material_id").primary();
    table.string("event_id");
    table
      .foreign("event_id")
      .references("events.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("material_url");
    table.string("title");
    table.text("description");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("events_materials");
};
