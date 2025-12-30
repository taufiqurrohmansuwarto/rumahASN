/**
 * Migration: Add notula columns to cc_meetings
 * Untuk fitur notula/rekap diskusi coaching clinic
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("cc_meetings", (table) => {
    // Konten notula/rekap diskusi
    table.text("notula");

    // Timestamp terakhir update notula
    table.timestamp("notula_updated_at");

    // Status pengiriman notula ke peserta
    table.boolean("notula_sent").defaultTo(false);
    table.timestamp("notula_sent_at");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("cc_meetings", (table) => {
    table.dropColumn("notula");
    table.dropColumn("notula_updated_at");
    table.dropColumn("notula_sent");
    table.dropColumn("notula_sent_at");
  });
};
