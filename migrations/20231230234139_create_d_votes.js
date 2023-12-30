/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("d_votes", function (table) {
    table.string("id").primary();
    table.string("post_id");
    table.string("comment_id");
    table.string("vote_type");
    table.dateTime("vote_time");
    table
      .foreign("comment_id")
      .references("id")
      .inTable("d_comments")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
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
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("d_votes");
};
