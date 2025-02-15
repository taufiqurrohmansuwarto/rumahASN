/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("signify")
    .createTable("document_versions", (table) => {
      table.string("id").primary();
      table
        .string("letter_id")
        .references("id")
        .inTable("signify.letters")
        .onDelete("CASCADE");
      table.integer("version_number");
      table.string("file_path");
      table.string("backup_file_path");
      table.string("status");
      table.string("signature_certificate");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("signify").dropTable("document_versions");
};
