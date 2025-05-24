/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("broadcast_groups", function (table) {
      table.string("id", 255).primary();
      table
        .string("created_by", 255)
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      table.string("name", 255).notNullable();
      table.text("description");

      // Broadcast type
      table
        .enum("type", ["all_users", "by_organization", "by_role", "custom"])
        .defaultTo("custom");

      // Criteria untuk auto-groups (JSON)
      table.jsonb("criteria");

      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);

      // Indexes
      table.index("created_by");
      table.index("type");
      table.index("is_active");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("broadcast_groups");
};
