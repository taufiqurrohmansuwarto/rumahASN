/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
      .raw(`CREATE SCHEMA IF NOT EXISTS perencanaan`)
      .then(() => {
        return knex.schema
          .withSchema("perencanaan")
          .createTable("riwayat_audit", (table) => {
            table.string("riwayat_audit_id").primary();
            table.string("formasi_id");
            table.string("usulan_id");
            table.string("aksi");
            table.jsonb("data_baru");
            table.jsonb("data_lama");
            table.string("dibuat_oleh");
            table.foreign("dibuat_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("dibuat_pada").defaultTo(knex.fn.now());
            table.string("diperbarui_oleh");
            table.foreign("diperbarui_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("diperbarui_pada").defaultTo(knex.fn.now());    
            table.string("ip_address");           
          });
      });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema
      .withSchema("perencanaan")
      .dropTableIfExists("riwayat_audit")
  };
  