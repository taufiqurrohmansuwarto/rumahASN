/**
 * Migration: Create rasn_chat.bookmarks table
 * Untuk menyimpan pesan yang di-bookmark oleh user
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("rasn_chat").createTable("bookmarks", (table) => {
    table.string("id").primary();
    table
      .string("user_id")
      .notNullable()
      .references("custom_id")
      .inTable("public.users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .string("message_id")
      .notNullable()
      .references("id")
      .inTable("rasn_chat.messages")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("note"); // Optional note for bookmark
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Unique: 1 user hanya bisa bookmark 1 message sekali
    table.unique(["user_id", "message_id"]);

    // Index for faster queries
    table.index("user_id");
    table.index("created_at");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_chat").dropTableIfExists("bookmarks");
};
