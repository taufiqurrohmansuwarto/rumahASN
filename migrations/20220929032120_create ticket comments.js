/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tickets_comments", (table) => {
    table.uuid("id").primary();
    table.uuid("ticket_id");
    table.string("user_id");
    table.text("comment");
    table.text("html");

    table.foreign("ticket_id").references("tickets.id");
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tickets_comments");
};
