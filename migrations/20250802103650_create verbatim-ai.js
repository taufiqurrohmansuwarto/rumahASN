/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`CREATE SCHEMA IF NOT EXISTS verbatim_ai`).then(() => {
    return knex.schema
      .withSchema("verbatim_ai")
      .createTable("sessions", (table) => {
        table.string("id").primary();
        table.text("nama_asesor");
        table.text("nama_asesi");
        table.dateTime("tgl_wawancara");
        table.text("status");
        table.integer("jumlah_file");
        table.text("file_path");
        table.integer("durasi");
        table.text("keterangan");
        table.timestamps(true, true);
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`DROP SCHEMA IF EXISTS verbatim_ai`).then(() => {
    return knex.schema.raw(`DROP TABLE IF EXISTS verbatim_ai.sessions`);
  });
};
