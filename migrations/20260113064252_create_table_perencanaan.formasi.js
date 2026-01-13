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
          .createTable("formasi", (table) => {
            table.string("formasi_id").primary();
            table.string("deskripsi");
            table.integer("tahun");
            table.enum("status", ["aktif", "nonaktif"]);
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
      .dropTableIfExists("formasi")
  };
  