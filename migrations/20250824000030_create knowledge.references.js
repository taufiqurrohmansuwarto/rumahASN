/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .createTable("references", (table) => {
      table.string("id").primary();
      table
        .string("content_id")
        .references("id")
        .inTable("knowledge.contents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("title");
      table.string("url");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").dropTable("references");
};
