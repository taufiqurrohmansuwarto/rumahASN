/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("esign.signature_requests", function (table) {
    table.string("type").defaultTo("self_sign");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("esign.signature_requests", function (table) {
    table.dropColumn("type");
  });
};
