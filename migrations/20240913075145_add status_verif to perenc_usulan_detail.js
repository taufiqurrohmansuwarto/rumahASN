/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("perenc_usulan_detail", function (table) {
    table.string("status_verif");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("perenc_usulan_detail", function (table) {
    table.dropColumn("status_verif");
  });
};