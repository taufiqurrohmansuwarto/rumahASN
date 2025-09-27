/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("esign")
    .createTable("bsre_transactions", function (table) {
      table.string("id").primary();
      /**
     * signature_detail_id INTEGER NOT NULL REFERENCES signature_details(id),
    document_id INTEGER NOT NULL REFERENCES documents(id),
    bsre_id VARCHAR(255),
    original_file VARCHAR(500) NOT NULL,
    signed_file VARCHAR(500),
    signed_file_hash VARCHAR(64),
    
    -- Penanda siapa yang melakukan TTE
    signed_by_delegate BOOLEAN DEFAULT FALSE, -- TRUE jika ajudan yang TTE pakai akun pimpinan
    delegate_notes TEXT, -- Catatan jika ditandatangani oleh ajudan
    
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(30) DEFAULT 'pending', -- pending, success, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
     */

      table
        .string("signature_detail_id")
        .references("id")
        .inTable("esign.signature_details")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .string("document_id")
        .references("id")
        .inTable("esign.documents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("bsre_id");
      table.string("original_file");
      table.string("signed_file");
      table.string("signed_file_hash");
      table.boolean("signed_by_delegate").defaultTo(false);
      table.text("delegate_notes");
      table.jsonb("request_data");
      table.jsonb("response_data");
      table.string("status").defaultTo("pending");
      table.text("error_message");
      table.timestamps(true, true);
      table.datetime("completed_at");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("bsre_transactions");
};
