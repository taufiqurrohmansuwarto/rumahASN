/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("app_grants", (table) => {
    table.increments("id").primary();
    table
      .integer("role_id")
      .unsigned()
      .references("id")
      .inTable("app_roles")
      .onDelete("CASCADE");
    table
      .integer("granted_role_id")
      .unsigned()
      .references("id")
      .inTable("app_roles")
      .onDelete("CASCADE");

    table.unique(["role_id", "granted_role_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
