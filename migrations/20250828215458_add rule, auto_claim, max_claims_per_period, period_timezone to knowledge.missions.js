/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("missions", (table) => {
    table.jsonb("rule").nullable();
    table.boolean("auto_claim").defaultTo(true);
    table.integer("max_claims_per_period").defaultTo(1);
    table.text("period_timezone").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("missions", (table) => {
    table.dropColumn("rule");
    table.dropColumn("auto_claim");
    table.dropColumn("max_claims_per_period");
    table.dropColumn("period_timezone");
  });
};
