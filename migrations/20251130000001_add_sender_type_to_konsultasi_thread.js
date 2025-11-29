/**
 * Migration: Add sender_type column to konsultasi_hukum_thread
 *
 * This distinguishes messages from 'user' vs 'admin'
 * even when the same person acts as both roles.
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("konsultasi_hukum_thread", function (table) {
      table
        .string("sender_type", 20)
        .defaultTo("user")
        .comment("Sender type: user or admin");
    });
};

exports.down = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("konsultasi_hukum_thread", function (table) {
      table.dropColumn("sender_type");
    });
};
