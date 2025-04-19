/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("siasn_download", (table) => {
    table.dropUnique(["siasn_layanan", "siasn_layanan_id"]);
    table.string("type");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("siasn_download", (table) => {
    table.dropColumn("type");
    table.unique(["siasn_layanan", "siasn_layanan_id"]);
  });
};
