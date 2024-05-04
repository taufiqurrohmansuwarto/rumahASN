/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("discussion_votes", (table) => {
    table.increments("id").primary();
    table
      .uuid("discussion_id")
      .references("id")
      .inTable("discussions")
      .onDelete("CASCADE");
    table
      .string("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("vote_type");
    table.unique(["discussion_id", "user_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("discussion_votes");
};
