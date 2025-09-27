/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
/**-- 3. Tabel Signature Details (dengan field marking)
CREATE TABLE signature_details (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    role_type VARCHAR(20) NOT NULL, -- reviewer atau signer
    sequence_order INTEGER DEFAULT 1,
    status VARCHAR(30) DEFAULT 'waiting', -- waiting, reviewed, signed, marked_for_tte, rejected
    
    -- Field untuk marking (Ibu Kepala marking untuk ajudan)
    is_marked_for_tte BOOLEAN DEFAULT FALSE, -- Apakah sudah ditandai siap TTE oleh pimpinan
    marked_at TIMESTAMP, -- Kapan ditandai
    marked_notes TEXT, -- Catatan saat marking (misal: "Siap TTE oleh ajudan")
    signed_by_delegate BOOLEAN DEFAULT FALSE, -- Apakah yang TTE adalah ajudan (pakai akun yang sama)
    
    -- Field untuk reject
    rejection_reason TEXT,
    rejected_at TIMESTAMP,
    
    -- Koordinat TTE
    signature_page INTEGER DEFAULT 1,
    signature_x INTEGER,
    signature_y INTEGER,
    
    notes TEXT,
    signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); */
exports.up = function (knex) {
  return knex.schema
    .withSchema("esign")
    .createTable("signature_details", function (table) {
      table.string("id").primary();
      table
        .string("request_id")
        .references("id")
        .inTable("esign.signature_requests")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .string("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("role_type").defaultTo("reviewer");
      table.integer("sequence_order").defaultTo(1);
      table.string("status").defaultTo("waiting");
      table.boolean("is_marked_for_tte").defaultTo(false);
      table.datetime("marked_at");
      table.text("marked_notes");
      table.boolean("signed_by_delegate").defaultTo(false);
      table.text("rejection_reason");
      table.datetime("rejected_at");
      table.integer("signature_page").defaultTo(1);
      table.integer("signature_x");
      table.integer("signature_y");
      table.text("notes");
      table.datetime("signed_at");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("signature_details");
};
