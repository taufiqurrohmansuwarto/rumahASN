/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("reactions_discussions", (table) => {
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
    table.string("reaction");
    table.primary(["discussion_id", "user_id", "reaction"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("reactions_discussions");
};
