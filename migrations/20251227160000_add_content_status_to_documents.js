/**
 * Migration: Add content_status column to documents table
 * Tracks the status of AI-powered markdown formatting
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_naskah")
    .alterTable("documents", (table) => {
      table
        .enum("content_status", [
          "pending", // Belum diproses
          "formatting", // Sedang diformat AI
          "ready", // Sudah siap
          "failed", // Gagal format
        ])
        .defaultTo("ready");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("rasn_naskah")
    .alterTable("documents", (table) => {
      table.dropColumn("content_status");
    });
};
