/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_pemberhentian", (table) => {
    table.string("gajiPensiunBulat").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_pemberhentian", (table) => {
    table.dropColumn("gajiPensiunBulat");
  });
};
