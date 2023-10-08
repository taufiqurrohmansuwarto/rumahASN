/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("employee_services", function (table) {
    table.increments("id").primary();
    table.string("title");
    table.text("description");
    table.string("slug");
    table.string("icon_url");
    table.integer("views").defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("employee_services");
};
