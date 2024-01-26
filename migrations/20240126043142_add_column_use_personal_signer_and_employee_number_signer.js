/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("webinar_series", (table) => {
    table.boolean("use_personal_signer").defaultTo(false);
    table.string("employee_number_signer");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("webinar_series", (table) => {
    table.dropColumn("use_personal_signer");
    table.dropColumn("employee_number_signer");
  });
};
