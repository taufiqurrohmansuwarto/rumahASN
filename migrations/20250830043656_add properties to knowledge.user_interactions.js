/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("user_interactions", (table) => {
      table
        .string("parent_comment_id")
        .references("id")
        .inTable("knowledge.user_interactions")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.integer("replies_count").defaultTo(0);
      table.integer("likes_count").defaultTo(0);
      table.boolean("is_pinned").defaultTo(false);
      table.integer("depth").defaultTo(0);
      table.boolean("is_edited").defaultTo(false);
      table.timestamp("edited_at").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("user_interactions", (table) => {
      table.dropColumn("parent_comment_id");
      table.dropColumn("replies_count");
      table.dropColumn("likes_count");
      table.dropColumn("is_pinned");
      table.dropColumn("depth");
      table.dropColumn("is_edited");
      table.dropColumn("edited_at");
    });
};
