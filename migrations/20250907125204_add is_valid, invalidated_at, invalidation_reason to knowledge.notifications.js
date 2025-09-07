/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("notifications", (table) => {
      table.boolean("is_valid").defaultTo(true);
      table.timestamp("invalidated_at").nullable();
      table.string("invalidation_reason").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("notifications", (table) => {
      table.dropColumn("is_valid");
      table.dropColumn("invalidated_at");
      table.dropColumn("invalidation_reason");
    });
};
