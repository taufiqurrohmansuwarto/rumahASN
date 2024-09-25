/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("siasn_kp", function (table) {
    table.string("angka_kredit").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("siasn_kp", function (table) {
    table.dropColumn("angka_kredit");
  });
};
