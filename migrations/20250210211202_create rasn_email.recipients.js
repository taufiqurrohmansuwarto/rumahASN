/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("recipients", (table) => {
      table.string("id").primary();
      table
        .string("email_id")
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");
      table
        .string("recipient_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE");

      table.enum("recipient_type", ["to", "cc", "bcc"]);
      table.dateTime("read_at");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("recipients");
};
