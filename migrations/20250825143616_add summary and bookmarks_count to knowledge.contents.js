/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.text("summary").nullable();
    table.integer("bookmarks_count").defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.dropColumn("summary");
    table.dropColumn("bookmarks_count");
  });
};
