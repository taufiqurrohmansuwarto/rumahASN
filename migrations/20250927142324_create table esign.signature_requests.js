/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("esign")
    .createTable("signature_requests", function (table) {
      table.string("id").primary();
      table
        .string("document_id")
        .references("id")
        .inTable("esign.documents")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("request_type").defaultTo("parallel");
      table.string("status").defaultTo("pending");
      table.text("notes");
      table
        .string("created_by")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.timestamps(true, true);
      table.datetime("completed_at");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("signature_requests");
};
