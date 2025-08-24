/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .createTable("content_attachments", (table) => {
      table.string("id").primary();
      table
        .string("content_id")
        .references("id")
        .inTable("knowledge.contents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("name");
      table.string("url");
      table.integer("size");
      table.string("mime");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").dropTable("content_attachments");
};
