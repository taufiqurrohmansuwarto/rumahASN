/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("socmed_posts", (table) => {
    table.string("id").primary();
    table.string("user_id");
    table.text("content");
    table.timestamp("post_time");
    table.integer("likes_count");
    table.integer("comments_count");
    table.integer("shares_count");

    table
      .foreign("user_id")
      .references("users.custom_id")
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
  return knex.schema.dropTable("socmed_posts");
};
