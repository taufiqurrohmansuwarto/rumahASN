/**
 * Migration: Add catatan column to sapa_asn tables
 *
 * This migration adds 'catatan' (admin notes) column to:
 * - sapa_asn.advokasi
 * - sapa_asn.konsultasi_hukum
 * - sapa_asn.pendampingan
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("advokasi", function (table) {
      table
        .text("catatan")
        .nullable()
        .comment("Catatan dari admin untuk pemohon");
    })
    .alterTable("konsultasi_hukum", function (table) {
      table
        .text("catatan")
        .nullable()
        .comment("Catatan dari admin untuk pemohon");
    })
    .alterTable("pendampingan", function (table) {
      table
        .text("catatan")
        .nullable()
        .comment("Catatan dari admin untuk pemohon");
    });
};

exports.down = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("advokasi", function (table) {
      table.dropColumn("catatan");
    })
    .alterTable("konsultasi_hukum", function (table) {
      table.dropColumn("catatan");
    })
    .alterTable("pendampingan", function (table) {
      table.dropColumn("catatan");
    });
};
