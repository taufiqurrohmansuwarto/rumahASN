/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("user_settings", function (table) {
      table.string("id", 255).primary();
      table
        .string("user_id", 255)
        .unique()
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      // Settings
      table.text("signature");
      table.boolean("email_notifications").defaultTo(true);
      table.integer("emails_per_page").defaultTo(25);
      table.boolean("auto_mark_read").defaultTo(false);

      table.timestamps(true, true);

      // Index
      table.index("user_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("user_settings");
};
