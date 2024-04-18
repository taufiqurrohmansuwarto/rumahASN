/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("event_galleries", (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
    table.string("event_id");
    table
      .foreign("event_id")
      .references("events.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("gallery_caption");
    table.string("gallery_url");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("event_galleries");
};
