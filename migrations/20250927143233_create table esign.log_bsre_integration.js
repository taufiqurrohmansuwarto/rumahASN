/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  /**
	 * id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES bsre_transactions(id),
    action VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    http_method VARCHAR(10),
    http_status INTEGER,
    request_payload JSONB,
    response_payload JSONB,
    error_detail TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	 */

  return knex.schema
    .withSchema("esign")
    .createTable("log_bsre_integration", function (table) {
      table.string("id").primary();
      table
        .string("transaction_id")
        .references("id")
        .inTable("esign.bsre_transactions")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("action");
      table.string("endpoint");
      table.string("http_method");
      table.integer("http_status");
      table.jsonb("request_payload");
      table.jsonb("response_payload");
      table.text("error_detail");
      table.integer("response_time_ms");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("log_bsre_integration");
};
