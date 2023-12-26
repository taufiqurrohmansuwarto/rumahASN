/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("socmed_likes", (table) => {
    table.string("id").primary();
    table.string("user_id");
    table.string("post_id");
    table.string("comment_id");
    table.timestamp("like_time");

    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("post_id")
      .references("socmed_posts.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("comment_id")
      .references("socmed_comments.id")
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
  return knex.schema.dropTable("socmed_likes");
};
