/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("content_versions", (table) => {
      table.integer("views_count").defaultTo(0);
      table.integer("likes_count").defaultTo(0);
      table.integer("comments_count").defaultTo(0);
      table.integer("bookmarks_count").defaultTo(0);
      table.integer("estimated_reading_time").defaultTo(0);
      table.jsonb("reading_complexity");
      table
        .string("verified_by")
        .references("custom_id")
        .inTable("users")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      table
        .string("author_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
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
      table.dropColumn("views_count");
      table.dropColumn("likes_count");
      table.dropColumn("comments_count");
      table.dropColumn("bookmarks_count");
      table.dropColumn("estimated_reading_time");
      table.dropColumn("reading_complexity");
      table.dropColumn("verified_by");
      table.dropColumn("author_id");
    });
};
