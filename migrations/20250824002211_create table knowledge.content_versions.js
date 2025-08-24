/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .createTable("content_versions", (table) => {
      table.string("id").primary();
      table
        .string("content_id")
        .references("id")
        .inTable("knowledge.contents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.integer("version");
      table
        .string("updated_by")
        .references("custom_id")
        .inTable("users")
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
  return knex.schema.withSchema("knowledge").dropTable("content_versions");
};
