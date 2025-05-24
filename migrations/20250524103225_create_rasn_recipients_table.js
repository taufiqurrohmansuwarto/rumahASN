/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("recipients", function (table) {
      table.string("id", 255).primary();
      table
        .string("email_id", 255)
        .notNullable()
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");
      table
        .string("recipient_id", 255)
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      // Recipient type
      table.enum("type", ["to", "cc", "bcc"]).notNullable();

      // Read status
      table.boolean("is_read").defaultTo(false);
      table.timestamp("read_at").nullable();

      // Gmail-like labels/folders
      table
        .enum("folder", [
          "inbox",
          "sent",
          "drafts",
          "starred",
          "archive",
          "trash",
          "spam",
        ])
        .defaultTo("inbox");

      // Soft delete
      table.boolean("is_deleted").defaultTo(false);
      table.timestamp("deleted_at").nullable();

      table.timestamps(true, true);

      // Indexes
      table.index("email_id");
      table.index("recipient_id");
      table.index("type");
      table.index("folder");
      table.index("is_read");
      table.index("is_deleted");
      table.index(["recipient_id", "folder", "is_deleted"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("recipients");
};
