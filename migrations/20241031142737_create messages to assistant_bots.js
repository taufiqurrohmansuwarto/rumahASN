/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .createTable("messages", (table) => {
      table.string("id").primary();
      table.string("thread_id");
      table
        .foreign("thread_id")
        .references("id")
        .inTable("assistant_bot.chat_threads")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("content");
      table.string("role");
      table.jsonb("metadata");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("assistant_bot").dropTableIfExists("messages");
};
