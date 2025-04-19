/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("siasn_download", function (table) {
    table.increments("id").primary();
    table.string("siasn_layanan");
    table.string("siasn_layanan_id");
    table.text("nama_file");
    table.timestamps(true, true);
    table.unique(["siasn_layanan", "siasn_layanan_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("siasn_download");
};
