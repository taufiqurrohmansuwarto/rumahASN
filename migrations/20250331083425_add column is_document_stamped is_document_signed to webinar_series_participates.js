/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("webinar_series_participates", (table) => {
    table.boolean("is_document_stamped").defaultTo(false);
    table.boolean("is_document_signed").defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("webinar_series_participates", (table) => {
    table.dropColumn("is_document_stamped");
    table.dropColumn("is_document_signed");
  });
};
