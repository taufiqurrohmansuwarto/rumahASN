/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "tickets_comments_customers_agents",
    (table) => {
      table.increments("id").primary();
      table.uuid("ticket_id");
      table.string("customer_id");
      table.string("agent_id");
      table.string("comment");
      table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
      table.datetime("updated_at").notNullable().defaultTo(knex.fn.now());
      table.foreign("ticket_id").references("tickets.id");
      table.foreign("customer_id").references("users.custom_id");
      table.foreign("agent_id").references("users.custom_id");
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tickets_comments_customsers_agents");
};
