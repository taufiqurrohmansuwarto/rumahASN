/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tickets", function (table) {
    table.uuid("id").primary();
    table.string("title");
    table.string("description");
    table.text("content");
    table.text("html");
    table.text("ticket_number");

    // foreign key references, categories, status, users
    table.integer("category_id");
    table.uuid("status_id");
    table.integer("priority_id");

    table.string("assignee");
    table.string("requester");

    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.datetime("start_work_at");
    table.datetime("completed_at");

    table.foreign("category_id").references("categories.id");
    table.foreign("status_id").references("status.id");
    table.foreign("priority_id").references("priorities.id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tickets");
};
