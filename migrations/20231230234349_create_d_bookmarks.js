/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("d_bookmarks", function (table) {
    table.string("id").primary();
    table.string("user_id");
    table.string("post_id");
    table
      .foreign("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("post_id")
      .references("id")
      .inTable("d_posts")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.timestamps(true, true);
    table.unique(["user_id", "post_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
