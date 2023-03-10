/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("ticket_status_histories", (table) => {
    table.increments("id").primary();
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id");
    table.uuid("ticket_id");
    table.foreign("ticket_id").references("tickets.id");
    table.string("status");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("ticket_status_histories");
};
