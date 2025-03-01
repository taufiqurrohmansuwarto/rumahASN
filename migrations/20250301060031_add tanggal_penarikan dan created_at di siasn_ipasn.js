/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_ipasn", function (table) {
    table.timestamp("tanggal_penarikan").nullable();
    table.timestamp("created_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_ipasn", function (table) {
    table.dropColumn("tanggal_penarikan");
    table.dropColumn("created_at");
  });
};
