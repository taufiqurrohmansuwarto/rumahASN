/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("ref_siasn_unor", function (table) {
    table.increments("id").primary();
    table.string("Id");
    table.string("InstansiId");
    table.string("DiatasanId");
    table.string("EselonId");
    table.string("NamaUnor");
    table.string("NamaJabatan");
    table.string("CepatKode");
    table.string("IndukUnorId");
    table.string("PemimpinPnsId");
    table.string("JenisUnorId");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("ref_siasn_unor");
};
