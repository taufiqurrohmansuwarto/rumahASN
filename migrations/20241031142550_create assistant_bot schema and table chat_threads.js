/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS assistant_bot`)
    .then(() => {
      return knex.schema
        .withSchema("assistant_bot")
        .createTable("chat_threads", (table) => {
          table.string("id").primary();
          table.string("user_id");
          table
            .foreign("user_id")
            .references("users.custom_id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

          table.string("title");
          table.string("status").defaultTo("active");
          table.jsonb("metadata");
          table.timestamps(true, true);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .dropTableIfExists("chat_threads")
    .then(() => {
      return knex.schema.raw("DROP SCHEMA IF EXISTS assistant_bot CASCADE");
    });
};
