/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .createTable("document_revisions", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

      // User yang mengajukan
      table.string("user_id").notNullable();
      table
        .foreign("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE");

      // Data dokumen yang perlu diperbaiki
      table.string("nip", 18).notNullable();
      table.string("document_type", 10).notNullable(); // SK, PERTEK, SPMT, PK
      table.string("tmt", 8).notNullable(); // Format: 01012025

      // Jenis dan alasan perbaikan
      table.string("revision_type", 50).notNullable(); // nama, gaji, pendidikan, dll
      table.text("reason").notNullable(); // Detail perbaikan

      // Status pengajuan
      table
        .enum("status", ["pending", "in_progress", "completed", "rejected"])
        .defaultTo("pending");

      // Response dari admin
      table.text("admin_notes");
      table.string("processed_by");
      table
        .foreign("processed_by")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("SET NULL");
      table.timestamp("processed_at");

      // Timestamps
      table.timestamps(true, true);

      // Index untuk query cepat
      table.index("user_id");
      table.index("nip");
      table.index("status");
      table.index(["nip", "document_type", "tmt"]);
    })
    .then(() => {
      // Partial unique index: hanya 1 pengajuan aktif per dokumen
      return knex.raw(`
        CREATE UNIQUE INDEX idx_document_revisions_active_request
        ON pengadaan.document_revisions (nip, document_type, tmt)
        WHERE status IN ('pending', 'in_progress')
      `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex
    .raw(
      "DROP INDEX IF EXISTS siasn_pengadaan.idx_document_revisions_active_request"
    )
    .then(() => {
      return knex.schema
        .withSchema("pengadaan")
        .dropTableIfExists("document_revisions");
    });
};
