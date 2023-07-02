/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("dokumen", (table) => {
    table.string("id").primary();
    table.string("pejabat_tte");
    table.foreign("pejabat_tte").references("pejabat_tte.custom_id");
    table.string("nama_dokumen");
    table.string("nomer");
    table.jsonb("bidang_json");
    table.string("bidang");
    table.text("keterangan");
    table.integer("revisi_ke");
    table.string("status");
    table.text("keterangan_status");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("dokumen");
};
