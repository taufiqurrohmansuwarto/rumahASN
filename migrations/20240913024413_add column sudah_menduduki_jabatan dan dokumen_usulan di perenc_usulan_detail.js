/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("perenc_usulan_detail", (table) => {
    table.boolean("sudah_menduduki_jabatan").defaultTo(false);
    table.string("dokumen_usulan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("perenc_usulan_detail", (table) => {
    table.dropColumn("sudah_menduduki_jabatan");
    table.dropColumn("dokumen_usulan");
  });
};
