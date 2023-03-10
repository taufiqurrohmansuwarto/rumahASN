/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("subscriptions", (table) => {
    table.string("user_id").notNullable();
    table.foreign("user_id").references("users.custom_id");
    table.uuid("ticket_id").notNullable();
    table.foreign("ticket_id").references("tickets.id");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.primary(["user_id", "ticket_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("subscriptions");
};
