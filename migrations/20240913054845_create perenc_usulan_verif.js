/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("perenc_usulan_verif", function (table) {
    table.string("id").primary();
    table.string("link_surat_usulan");
    table.string("link_lampiran");
    table.string("link_anjab_abk");
    table.string("link_ketersediaan_anggaran");
    table.boolean("sudah_kirim").defaultTo(false);
    table
      .integer("perenc_usulan_id")
      .unsigned()
      .references("id")
      .inTable("perenc_usulan")
      .onDelete("cascade")
      .onUpdate("cascade");
    table
      .string("user_id")
      .unsigned()
      .references("custom_id")
      .inTable("users")
      .onDelete("cascade")
      .onUpdate("cascade");
    table.string("catatan");
    table.unique(["perenc_usulan_id", "user_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("perenc_usulan_verif");
};
