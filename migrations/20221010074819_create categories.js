/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("categories", (table) => {
    table.string("kode_satuan_kerja");
    table.jsonb("satuan_kerja");
    table.text("description");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("categories", (table) => {
    table.dropColumn("kode_satuan_kerja");
    table.dropColumn("satuan_kerja");
    table.dropColumn("description");
  });
};
