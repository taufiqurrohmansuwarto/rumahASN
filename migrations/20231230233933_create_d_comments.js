/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("d_comments", function (table) {
    table.string("id").primary();
    table.string("post_id");
    table
      .foreign("post_id")
      .references("id")
      .inTable("d_posts")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("user_id");
    table
      .foreign("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("comment");
    table.dateTime("comment_time");
    table.string("parent_id");
    table
      .foreign("parent_id")
      .references("id")
      .inTable("d_comments")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.integer("upvote_count").defaultTo(0);
    table.integer("downvote_count").defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("d_comments");
};
