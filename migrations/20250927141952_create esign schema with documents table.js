/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // Buat schema esign jika belum ada
    await trx.raw("CREATE SCHEMA IF NOT EXISTS esign");

    // Buat tabel documents di schema esign
    return trx.schema
      .withSchema("esign")
      .createTable("documents", function (table) {
        table.string("id").primary();
        table.string("document_code");
        table.string("title");
        table.string("description");
        table.string("file_path");
        table.string("file_hash");
        table.integer("file_size");
        table.boolean("is_public").defaultTo(false);
        table.string("status").defaultTo("draft");
        table
          .string("created_by")
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("documents");
};
