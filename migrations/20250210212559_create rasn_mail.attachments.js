/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("attachments", (table) => {
      table.string("id").primary();
      table
        .string("email_id")
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");
      table.string("file_name");
      table.string("file_url");
      table.string("mime_type");
      table.bigInteger("file_size");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("attachments");
};
