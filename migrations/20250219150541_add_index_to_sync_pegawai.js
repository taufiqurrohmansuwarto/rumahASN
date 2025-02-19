/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sync_pegawai", (table) => {
    table.index("nip_master", "idx_nip_master");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sync_pegawai", (table) => {
    table.dropIndex("nip_master", "idx_nip_master");
  });
};
