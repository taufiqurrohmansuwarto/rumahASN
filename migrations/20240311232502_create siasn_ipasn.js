/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_ipasn", function (table) {
    table.increments("id").primary();
    table.string("nip");
    table.string("nama");
    table.string("unor");
    table.decimal("kualifikasi");
    table.decimal("kompetensi");
    table.decimal("kinerja");
    table.decimal("disiplin");
    table.decimal("total");
    table.integer("tahun");
    table.string("updated");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_ipasn");
};
