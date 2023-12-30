/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("d_groups", function (table) {
    table.string("id").primary();
    table.string("name");
    table.text("description");
    table.timestamps(true, true);
    table.string("user_id");
    table.foreign("user_id").references("custom_id").inTable("users");
    table.integer("member_count").defaultTo(0);
    table.text("group_rules");
    table
      .enum("group_privacy", ["public", "private", "secret"])
      .defaultTo("public");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("d_groups");
};
