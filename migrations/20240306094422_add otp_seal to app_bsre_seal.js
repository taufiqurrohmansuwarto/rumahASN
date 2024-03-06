/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("app_bsre_seal", function (table) {
    table.string("otp_seal");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("app_bsre_seal", function (table) {
    table.dropColumn("otp_seal");
  });
};
