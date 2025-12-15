/**
 * Migration: Add attachment_disposisi column to sapa_asn.pendampingan
 *
 * This migration adds 'attachment_disposisi' column for storing
 * the URL of disposition attachment when admin rejects a request.
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("pendampingan", function (table) {
      table
        .text("attachment_disposisi")
        .nullable()
        .comment("URL lampiran disposisi penolakan dari admin");
    });
};

exports.down = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("pendampingan", function (table) {
      table.dropColumn("attachment_disposisi");
    });
};

