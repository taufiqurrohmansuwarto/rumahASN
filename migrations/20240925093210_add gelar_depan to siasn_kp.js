/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("siasn_kp", function (table) {
    table.string("gelar_depan").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("siasn_kp", function (table) {
    table.dropColumn("gelar_depan");
  });
};
