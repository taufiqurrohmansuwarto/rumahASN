/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("events", (table) => {
    table.string("id").primary();
    table.string("kode_event").unique().notNullable();
    table.string("title");
    table.text("description");
    table.string("location");
    table.dateTime("start_datetime");
    table.dateTime("end_datetime");
    table.string("created_by");
    table
      .foreign("created_by")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("events");
};
