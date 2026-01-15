exports.up = function (knex) {
  return knex.schema
    .withSchema("perencanaan")
    .createTable("formasi_usulan", (table) => {
      table.string("formasi_usulan_id").primary();
      table
        .string("formasi_id")
        .references("formasi_id")
        .inTable("perencanaan.formasi")
        .onDelete("CASCADE");
      table.string("user_id").index(); // Operator yang membuat
      table.boolean("is_confirmed").defaultTo(false); // false = Draft, true = Final
      table
        .enu("status", [
          "draft",
          "menunggu",
          "disetujui",
          "ditolak",
          "perbaikan",
        ])
        .defaultTo("draft");
      table.text("catatan"); // Catatan dari verifikator
      table.string("corrector_id"); // Admin yang memverifikasi
      table.timestamp("corrected_at");
      table.text("dokumen_url"); // URL dokumen pendukung
      table.text("dokumen_name"); // Nama file
      table.string("dibuat_oleh");
      table.string("diperbarui_oleh");
      table.timestamp("dibuat_pada").defaultTo(knex.fn.now());
      table.timestamp("diperbarui_pada").defaultTo(knex.fn.now());
    })
    .then(() => {
      // Alter table usulan needs to be handled carefully with schema
      return knex.schema.withSchema("perencanaan").table("usulan", (table) => {
        // Hapus foreign key lama
        table.dropColumn("formasi_id");
        // Tambah foreign key baru
        table
          .string("formasi_usulan_id")
          .references("formasi_usulan_id")
          .inTable("perencanaan.formasi_usulan")
          .onDelete("CASCADE");
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .withSchema("perencanaan")
    .table("usulan", (table) => {
      table.dropColumn("formasi_usulan_id");
      table
        .string("formasi_id")
        .references("formasi_id")
        .inTable("perencanaan.formasi")
        .onDelete("CASCADE");
    })
    .then(() => {
        return knex.schema.withSchema("perencanaan").dropTable("formasi_usulan");
    });
};