/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`CREATE SCHEMA IF NOT EXISTS signify`).then(() => {
    return knex.schema.withSchema("signify").createTable("letters", (table) => {
      table.string("id").primary();
      table.string("title");
      table.text("description");
      table.integer("current_version").defaultTo(1);
      table.integer("current_step").defaultTo(1);
      table.string("current_status");
      table
        .string("submitted_by")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE");
      table.timestamps(true, true);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`DROP SCHEMA IF EXISTS signify`);
};
