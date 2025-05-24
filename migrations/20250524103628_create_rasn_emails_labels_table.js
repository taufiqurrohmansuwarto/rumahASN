/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("email_labels", function (table) {
      table.string("id", 255).primary();
      table
        .string("email_id", 255)
        .notNullable()
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");
      table
        .string("label_id", 255)
        .notNullable()
        .references("id")
        .inTable("rasn_mail.labels")
        .onDelete("CASCADE");
      table
        .string("user_id", 255)
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      table.timestamps(true, true);

      // Indexes
      table.index("email_id");
      table.index("label_id");
      table.index("user_id");
      table.unique(["email_id", "label_id", "user_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("email_labels");
};
