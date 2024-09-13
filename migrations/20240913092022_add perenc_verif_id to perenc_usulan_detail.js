/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("perenc_usulan_detail", (table) => {
    table
      .string("perencanaan_verif_id")
      .references("id")
      .inTable("perenc_usulan_verif")
      .onDelete("cascade");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("perenc_usulan_detail", (table) => {
    table.dropForeign("perencanaan_verif_id");
    table.dropColumn("perencanaan_verif_id");
  });
};
