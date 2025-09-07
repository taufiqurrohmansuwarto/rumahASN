/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .createTable("notifications", (table) => {
      table.string("id").primary();
      table
        .string("user_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("type");
      table.string("title");
      table.text("message");
      table
        .string("content_id")
        .references("id")
        .inTable("knowledge.contents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .string("comment_id")
        .references("id")
        .inTable("knowledge.user_interactions")
        .onDelete("SET NULL");
      table
        .string("actor_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");

      table.boolean("is_read").defaultTo(false);
      table.boolean("is_sent").defaultTo(false);
      table.jsonb("data");
      table.timestamps(true, true);
      table.timestamp("read_at").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("knowledge").dropTable("notifications");
};
