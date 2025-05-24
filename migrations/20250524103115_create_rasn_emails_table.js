/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .createTable("emails", function (table) {
      table.string("id", 255).primary();
      table
        .string("sender_id", 255)
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      // Email content
      table.string("subject", 500);
      table.text("content");

      // Email type
      table.enum("type", ["personal", "broadcast"]).defaultTo("personal");
      table.enum("priority", ["low", "normal", "high"]).defaultTo("normal");

      // Status
      table.boolean("is_draft").defaultTo(false);
      table.boolean("is_starred").defaultTo(false);

      // Threading untuk reply/forward
      table
        .string("parent_id", 255)
        .nullable()
        .references("id")
        .inTable("rasn_mail.emails");
      table.string("thread_subject", 500); // Original subject for threading

      // Timestamps
      table.timestamp("sent_at").nullable();
      table.timestamps(true, true);

      // Indexes
      table.index("sender_id");
      table.index("type");
      table.index("is_draft");
      table.index("parent_id");
      table.index("created_at");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("emails");
};
