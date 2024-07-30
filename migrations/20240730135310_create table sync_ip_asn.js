/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("sync_ip_asn", (table) => {
    table.increments("id").primary();
    table.string("nip");
    table.string("jabatan");
    table.text("unit_kerja");
    table.string("skpd_id");
    table.decimal("subtotal", null, 2).defaultTo(0);
    table.decimal("kualifikasi", null, 2).defaultTo(0);
    table.decimal("kompetensi", null, 2).defaultTo(0);
    table.decimal("kinerja", null, 2).defaultTo(0);
    table.decimal("displin", null, 2).defaultTo(0);
    table.integer("tahun");
    table.string("status");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("sync_ip_asn");
};
