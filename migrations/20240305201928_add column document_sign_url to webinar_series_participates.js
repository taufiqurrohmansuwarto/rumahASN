/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("webinar_series_participates", function (table) {
    table.text("document_sign_url");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("webinar_series_participates", function (table) {
    table.dropColumn("document_sign_url");
  });
};
