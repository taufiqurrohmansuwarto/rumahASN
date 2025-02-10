/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("email_labels", (table) => {
      table.string("id").primary();
      table
        .string("email_id")
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");
      table
        .string("label_id")
        .references("id")
        .inTable("rasn_mail.labels")
        .onDelete("CASCADE");
      table.timestamps(true, true);
      table.unique(["email_id", "label_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("email_labels");
};
