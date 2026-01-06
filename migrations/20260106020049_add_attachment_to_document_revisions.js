/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("document_revisions", (table) => {
      // Tipe attachment: 'file' untuk upload file, 'link' untuk URL eksternal
      table.string("attachment_type", 10);
      // URL file di MinIO atau link eksternal
      table.text("attachment_url");
      // Nama file asli (untuk tampilan)
      table.string("attachment_name", 255);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("document_revisions", (table) => {
      table.dropColumn("attachment_type");
      table.dropColumn("attachment_url");
      table.dropColumn("attachment_name");
    });
};
