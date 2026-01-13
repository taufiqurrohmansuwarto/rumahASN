/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("perencanaan")
    .alterTable("usulan", function (table) {
      table.text("catatan").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("perencanaan")
    .alterTable("usulan", function (table) {
      table.dropColumn("catatan");
    });
};
