/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sync_ip_asn", (table) => {
    table.string("nama");
    table.string("pegawai_id");
    table.renameColumn("displin", "disiplin");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sync_ip_asn", (table) => {
    table.dropColumn("nama");
    table.dropColumn("pegawai_id");
    table.renameColumn("disiplin", "displin");
  });
};
