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
          .createTable("usulan", (table) => {
            table.string("usulan_id").primary();
            
            table
            .string("formasi_id")
            .references("formasi_id")
            .inTable("perencanaan.formasi")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

            table.string("jenis_jabatan");
            table.string("jabatan_id");
            table.jsonb("kualifikasi_pendidikan");
            table.integer("alokasi");
            table.string("unit_kerja");
            table.enum("status", ["disetujui", "ditolak", "menunggu" ,"perbaikan"]);
            table.string("alasan_perbaikan");
            table.string("lampiran_id");
            table.string("dibuat_oleh");
            table.foreign("dibuat_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("dibuat_pada").defaultTo(knex.fn.now());
            table.string("diperbarui_oleh");
            table.foreign("diperbarui_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("diperbarui_pada").defaultTo(knex.fn.now());
            table.string("diverifikasi_oleh");
            table.foreign("diverifikasi_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("diverifikasi_pada").defaultTo(knex.fn.now());                    
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
      .dropTableIfExists("usulan")
  };
  