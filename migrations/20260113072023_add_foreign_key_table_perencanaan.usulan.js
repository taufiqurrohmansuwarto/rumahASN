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
          .alterTable("usulan", (table) => {
            table
            .foreign("lampiran_id")
            .references("lampiran_id")
            .inTable("perencanaan.lampiran")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
                 
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
      .alterTable("usulan", (table) => {
        table.dropForeign("lampiran_id");
      });
  };
  