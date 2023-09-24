/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("anomali_23", (table) => {
    table.boolean("is_repaired").defaultTo(false);
    table.text("description");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("anomali_23", (table) => {
    table.dropColumn("is_repaired");
    table.dropColumn("description");
  });
};
