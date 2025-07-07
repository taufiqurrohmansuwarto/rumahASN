/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sync_pegawai", (table) => {
    table.string("no_hp_master");
    table.string("no_sk_cpns");
    table.string("no_sk_pns");
    table.string("tgl_sk_cpns");
    table.string("tgl_sk_pns");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sync_pegawai", (table) => {
    table.dropColumn("nomor_hp_master");
    table.dropColumn("no_sk_cpns");
    table.dropColumn("no_sk_pns");
    table.dropColumn("tgl_sk_cpns");
    table.dropColumn("tgl_sk_pns");
  });
};
