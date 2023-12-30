/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("d_memberships", function (table) {
    table.string("id").primary();
    table.string("group_id");
    table.foreign("group_id").references("id").inTable("d_groups");
    table.string("user_id");
    table.foreign("user_id").references("custom_id").inTable("users");
    table.string("role");
    table.timestamps(true, true);
    table.unique(["group_id", "user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("d_memberships");
};
