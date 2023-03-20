/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("comments-reactions", (table) => {
    table.integer("comment_id");
    table.string("user_id");
    table.string("reaction");
    table.primary(["comment_id", "user_id", "reaction"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("comments-reactions");
};
