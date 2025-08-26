/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("badges", (table) => {
    table.string("badge_type").defaultTo("level");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("badges", (table) => {
    table.dropColumn("badge_type");
  });
};
