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
          .createTable("lampiran", (table) => {
            table.string("lampiran_id").primary();
            
            table
            .string("usulan_id")
            .references("usulan_id")
            .inTable("perencanaan.usulan")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

            table.string("file_name");
            table.integer("file_size");
            table.string("file_url");
            table.string("file_type");
            table.string("unit_kerja");
            table.string("dibuat_oleh");
            table.foreign("dibuat_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("dibuat_pada").defaultTo(knex.fn.now());
            table.string("diperbarui_oleh");
            table.foreign("diperbarui_oleh").references("users.custom_id").onDelete("CASCADE").onUpdate("CASCADE");
            table.timestamp("diperbarui_pada").defaultTo(knex.fn.now());               
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
      .dropTableIfExists("lampiran")
  };
  