/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("p3k_paruh_waktu", function (table) {
      table.string("no_peserta");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("p3k_paruh_waktu", function (table) {
      table.dropColumn("no_peserta");
    });
};
