/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("submissions_references", (table) => {
    table.specificType("document_master", "text ARRAY");
    table.specificType("additional_dokumen", "text ARRAY");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("submissions_references", (table) => {
    table.dropColumn("document_master");
    table.dropColumn("additional_dokumen");
  });
};
