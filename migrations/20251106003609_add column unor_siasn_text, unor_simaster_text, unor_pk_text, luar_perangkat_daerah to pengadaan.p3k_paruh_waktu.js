/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("p3k_paruh_waktu", (table) => {
      table.text("unor_siasn_text");
      table.text("unor_simaster_text");
      table.text("unor_pk_text");
      table.boolean("luar_perangkat_daerah").defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("p3k_paruh_waktu", (table) => {
      table.dropColumn("unor_siasn_text");
      table.dropColumn("unor_simaster_text");
      table.dropColumn("unor_pk_text");
      table.dropColumn("luar_perangkat_daerah");
    });
};
