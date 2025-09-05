/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("content_versions", (table) => {
      table.string("title");
      table.text("content");
      table.text("summary");
      table.jsonb("tags");
      table
        .string("category_id")
        .references("id")
        .inTable("knowledge.category")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("type").defaultTo("text");
      table.string("source_url");
      table.string("status").defaultTo("archived");
      table.text("change_summary");
      table.text("reason");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("content_versions", (table) => {
      table.dropColumn("title");
      table.dropColumn("content");
      table.dropColumn("summary");
      table.dropColumn("tags");
      table.dropColumn("category_id");
      table.dropColumn("type");
      table.dropColumn("source_url");
      table.dropColumn("status");
      table.dropColumn("change_summary");
      table.dropColumn("reason");
    });
};
