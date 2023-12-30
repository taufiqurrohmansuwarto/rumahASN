/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("socmed_posts", (table) => {
    table.integer("likes_count").defaultTo(0);
    table.integer("comments_count").defaultTo(0);
    table.integer("shares_count").defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
