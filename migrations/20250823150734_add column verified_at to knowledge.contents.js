/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.timestamp("verified_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.dropColumn("verified_at");
  });
};
