/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("activities", (table) => {
    table.uuid("ticket_id");
    table.foreign("ticket_id").references("tickets.id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("activities", (table) => {
    table.dropColumn("ticket_id");
  });
};
