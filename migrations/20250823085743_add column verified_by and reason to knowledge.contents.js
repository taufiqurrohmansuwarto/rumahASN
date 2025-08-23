/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table
      .string("verified_by")
      .references("custom_id")
      .inTable("users")
      .onDelete("cascade")
      .onUpdate("cascade")
      .nullable();
    table.text("reason").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.dropColumn("verified_by");
    table.dropColumn("reason");
  });
};
