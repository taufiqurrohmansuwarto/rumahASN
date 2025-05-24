/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("attachments", function (table) {
      table.string("id", 255).primary();
      table
        .string("email_id", 255)
        .notNullable()
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");

      // File info
      table.string("file_name", 255).notNullable();
      table.string("file_url", 500).notNullable();
      table.bigInteger("file_size").notNullable();
      table.string("mime_type", 100);

      table.timestamps(true, true);

      // Indexes
      table.index("email_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("attachments");
};
