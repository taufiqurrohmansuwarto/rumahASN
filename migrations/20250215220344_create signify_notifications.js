/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("signify")
    .createTable("notifications", (table) => {
      table.string("id").primary();
      table
        .string("letter_id")
        .references("id")
        .inTable("signify.letters")
        .onDelete("CASCADE");
      table
        .string("user_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE");

      table.text("message");
      table.boolean("is_read").defaultTo(false);
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("signify").dropTable("notifications");
};
