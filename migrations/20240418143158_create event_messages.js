/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("event_messages", (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
    table.string("event_id");
    table.foreign("event_id").references("events.id");
    table.string("message_title");
    table.text("message_content");
    table.string("sender_id");
    table.dateTime("sent_at");
    table
      .foreign("sender_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("receiver_id");
    table
      .foreign("receiver_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("event_messages");
};
