/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users_permissions", function (table) {
    table.increments("id").primary();
    table.string("role_id").notNullable();
    table.integer("permission_id").notNullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.foreign("role_id").references("roles.name");
    table.foreign("permission_id").references("permissions.id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users_permissions");
};
