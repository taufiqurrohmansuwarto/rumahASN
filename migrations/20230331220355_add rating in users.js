/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("users", (table) => {
    table.integer("frekuensi_kunjungan").defaultTo(0);
    table.timestamp("terakhir_diberi_rate");
    table.integer("rating").defaultTo(0);
    table.integer("jumlah_tutup_rating").defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("frekuensi_kunjungan");
    table.dropColumn("terakhir_diberi_rate");
    table.dropColumn("rating");
    table.dropColumn("jumlah_tutup_rating");
  });
};
