/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.string("custom_id").primary();
    table.string("username");
    table.string("image");
    table.string("id");
    table.string("from");
    table.string("role");
    table.string("group");
    table.string("employee_number");
    // dateonly postgres for birthdate
    table.date("birthdate");
    table.datetime("last_login");
    table.string("email");
    table.string("organization_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
