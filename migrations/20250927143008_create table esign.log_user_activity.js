/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("esign")
    .createTable("log_user_activity", function (table) {
      /**id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL, -- login, upload_document, sign_document, mark_for_tte, reject_document
    entity_type VARCHAR(50),
    entity_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    additional_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP */
      table.string("id").primary();
      table
        .string("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("action");
      table.string("entity_type");
      table.integer("entity_id");
      table.string("ip_address");
      table.text("user_agent");
      table.jsonb("additional_data");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("log_user_activity");
};
