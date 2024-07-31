/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("ref_siasn_unor", (table) => {
    table.string("isUnorSekolah");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("ref_siasn_unor", (table) => {
    table.dropColumn("isUnorSekolah");
  });
};
