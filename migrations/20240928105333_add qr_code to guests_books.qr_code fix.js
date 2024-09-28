/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .alterTable("qr_code", (table) => {
      table.string("qr_code").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .alterTable("qr_code", (table) => {
      table.dropColumn("qr_code");
    });
};
