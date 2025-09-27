/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  /**
  * id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- view, download, print, sign, mark_for_tte, reject
    file_version VARCHAR(20),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP */
  return knex.schema
    .withSchema("esign")
    .createTable("log_document", function (table) {
      table.string("id").primary();
      table
        .string("document_id")
        .references("id")
        .inTable("esign.documents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .string("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("action");
      table.string("file_version");
      table.string("ip_address");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("log_document");
};
