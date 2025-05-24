/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("labels", function (table) {
      table.string("id", 255).primary();
      table
        .string("user_id", 255)
        .nullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      table.string("name", 100).notNullable();
      table.string("color", 7).defaultTo("#1890ff");
      table.boolean("is_system").defaultTo(false);
      table.integer("sort_order").defaultTo(0);

      table.timestamps(true, true);

      // Indexes
      table.index("user_id");
      table.index("is_system");
      table.unique(["user_id", "name"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("labels");
};
