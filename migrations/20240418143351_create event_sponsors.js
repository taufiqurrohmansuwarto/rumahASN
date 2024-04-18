/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("event_sponsors", (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
    table.string("event_id");
    table
      .foreign("event_id")
      .references("events.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("sponsor_name");
    table.string("sponsor_type");
    table.string("sponsor_logo_url");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("event_sponsors");
};
