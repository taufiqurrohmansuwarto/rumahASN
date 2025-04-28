/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_employees", function (table) {
    table.string("eselon_id").defaultTo(null);
    table.string("eselon_level").defaultTo(null);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_employees", function (table) {
    table.dropColumn("eselon_id");
    table.dropColumn("eselon_level");
  });
};
