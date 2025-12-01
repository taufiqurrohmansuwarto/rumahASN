/**
 * Migration: Add tempat_pengadilan and jadwal_pengadilan to pendampingan table
 * 
 * Menambahkan kolom:
 * - tempat_pengadilan: Tempat/nama pengadilan (VARCHAR)
 * - jadwal_pengadilan: Jadwal sidang (TIMESTAMP)
 * 
 * Kolom pengadilan_jadwal yang lama tetap dipertahankan untuk backward compatibility
 */

exports.up = async function (knex) {
  // Add columns to pendampingan table
  await knex.schema.withSchema("sapa_asn").alterTable("pendampingan", (table) => {
    table.string("tempat_pengadilan").nullable().comment("Nama/Tempat Pengadilan (e.g., PN Surabaya, PTUN Jakarta)");
    table.timestamp("jadwal_pengadilan").nullable().comment("Jadwal sidang pengadilan");
  });

  console.log("✅ Added tempat_pengadilan and jadwal_pengadilan columns to sapa_asn.pendampingan");
};

exports.down = async function (knex) {
  await knex.schema.withSchema("sapa_asn").alterTable("pendampingan", (table) => {
    table.dropColumn("tempat_pengadilan");
    table.dropColumn("jadwal_pengadilan");
  });

  console.log("✅ Removed tempat_pengadilan and jadwal_pengadilan columns from sapa_asn.pendampingan");
};

