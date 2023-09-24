/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("anomali_23", (table) => {
    table.renameColumn("jenis_anomali", "jenis_anomali_nama");
    table.renameColumn("nip", "nip_baru");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("anomali_23", (table) => {
    table.renameColumn("jenis_anomali_nama", "jenis_anomali");
    table.renameColumn("nip_baru", "nip");
  });
};
