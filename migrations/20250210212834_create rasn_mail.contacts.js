/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("contacts", (table) => {
      table.string("id").primary();
      table
        .string("user_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .string("contact_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("contact_email");
      table.string("first_name");
      table.string("last_name");
      table.unique(["user_id", "contact_email"]);
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("contacts");
};
