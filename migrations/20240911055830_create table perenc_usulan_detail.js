/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("perenc_usulan_detail", function (table) {
    table.increments("id").primary();
    table.integer("perenc_usulan_id");
    table.foreign("perenc_usulan_id").references("id").inTable("perenc_usulan");
    table.string("user_id");
    table.string("simaster_skpd_id");
    table.string("siasn_pend_id");
    table.string("simaster_jfu_id");
    table.integer("abk");
    table.integer("bezzeting");
    table.integer("lowongan");
    table.integer("usulan_formasi");
    table
      .foreign("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("cascade")
      .onUpdate("cascade");
    table
      .foreign("simaster_skpd_id")
      .references("id")
      .inTable("sync_unor_master")
      .onDelete("cascade")
      .onUpdate("cascade");
    table
      .foreign("siasn_pend_id")
      .references("id")
      .inTable("siasn_pend")
      .onDelete("cascade")
      .onUpdate("cascade");
    table
      .foreign("simaster_jfu_id")
      .references("id")
      .inTable("simaster_jfu")
      .onDelete("cascade")
      .onUpdate("cascade");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("perenc_usulan_detail");
};
