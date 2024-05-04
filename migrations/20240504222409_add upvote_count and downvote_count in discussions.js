/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("discussions", (table) => {
    table.integer("upvote_count").defaultTo(0);
    table.integer("downvote_count").defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("discussions", (table) => {
    table.dropColumn("upvote_count");
    table.dropColumn("downvote_count");
  });
};
