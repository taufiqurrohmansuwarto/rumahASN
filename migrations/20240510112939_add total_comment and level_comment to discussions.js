/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("discussions", function (table) {
    table.integer("total_comment").defaultTo(0);
    table.integer("level_comment").defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("discussions", function (table) {
    table.dropColumn("total_comment");
    table.dropColumn("level_comment");
  });
};
