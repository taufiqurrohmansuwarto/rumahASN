/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("upvotes_discussions", (table) => {
    table
      .uuid("discussion_id")
      .references("discussions.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .string("user_id")
      .references("users.custom_id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.primary(["discussion_id", "user_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("upvotes_discussions");
};
