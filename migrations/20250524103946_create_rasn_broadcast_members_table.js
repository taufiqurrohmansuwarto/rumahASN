/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("broadcast_members", function (table) {
      table.string("id", 255).primary();
      table
        .string("group_id", 255)
        .notNullable()
        .references("id")
        .inTable("rasn_mail.broadcast_groups")
        .onDelete("CASCADE");
      table
        .string("user_id", 255)
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      table.timestamps(true, true);

      // Indexes
      table.index("group_id");
      table.index("user_id");
      table.unique(["group_id", "user_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("broadcast_members");
};
