/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .createTable("p3k_paruh_waktu", (table) => {
      table.string("id").primary();
      table.string("nama");
      table.string("nip");
      table.string("unor_id_siasn");
      table.string("unor_id_simaster");
      table.string("gaji");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .dropTableIfExists("p3k_paruh_waktu");
};
