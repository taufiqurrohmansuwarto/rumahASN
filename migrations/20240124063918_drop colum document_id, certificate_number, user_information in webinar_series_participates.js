/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("webinar_series_participates", (table) => {
    table.dropColumn("document_id");
    table.dropColumn("certificate_number");
    table.dropColumn("user_information");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
