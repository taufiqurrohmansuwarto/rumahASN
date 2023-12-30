/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("d_posts", function (table) {
    table.string("id").primary();
    table.string("group_id");
    table.foreign("group_id").references("id").inTable("d_groups");
    table.string("user_id");
    table.foreign("user_id").references("custom_id").inTable("users");
    table.string("title");
    table.text("content_text");
    table.text("content_url");
    table.dateTime("post_time");
    table.integer("upvote_count").defaultTo(0);
    table.integer("downvote_count").defaultTo(0);
    table.integer("comment_count").defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("d_posts");
};
