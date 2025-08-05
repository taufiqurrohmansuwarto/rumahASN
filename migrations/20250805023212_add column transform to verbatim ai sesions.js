/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("verbatim_ai")
    .alterTable("sessions", (table) => {
      table.text("transform").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("verbatim_ai")
    .alterTable("sessions", (table) => {
      table.dropColumn("transform");
    });
};
