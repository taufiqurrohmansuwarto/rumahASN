/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.string("type").nullable();
    table.string("source_url").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").alterTable("contents", (table) => {
    table.dropColumn("type");
    table.dropColumn("source_url");
  });
};
