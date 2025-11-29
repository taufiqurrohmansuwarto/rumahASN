/**
 * Migration: Add unread tracking for konsultasi hukum threads
 *
 * Both user and admin can see read/unread status:
 * - is_read_by_admin: track if admin has read user's message
 * - is_read_by_user: track if user has read admin's message
 * - unread_count_admin: unread messages for admin (from user)
 * - unread_count_user: unread messages for user (from admin)
 */

exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("konsultasi_hukum_thread", function (table) {
      table
        .boolean("is_read_by_admin")
        .defaultTo(false)
        .comment("Has admin read this message? (for user messages)");
      table
        .boolean("is_read_by_user")
        .defaultTo(false)
        .comment("Has user read this message? (for admin messages)");
      table
        .timestamp("read_at")
        .nullable()
        .comment("When was message read by recipient");
    })
    .alterTable("konsultasi_hukum", function (table) {
      table
        .integer("unread_count_admin")
        .defaultTo(0)
        .comment("Unread messages for admin (from user)");
      table
        .integer("unread_count_user")
        .defaultTo(0)
        .comment("Unread messages for user (from admin)");
      table
        .timestamp("admin_last_read_at")
        .nullable()
        .comment("When admin last opened the thread");
      table
        .timestamp("user_last_read_at")
        .nullable()
        .comment("When user last opened the thread");
    });
};

exports.down = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .alterTable("konsultasi_hukum_thread", function (table) {
      table.dropColumn("is_read_by_admin");
      table.dropColumn("is_read_by_user");
      table.dropColumn("read_at");
    })
    .alterTable("konsultasi_hukum", function (table) {
      table.dropColumn("unread_count_admin");
      table.dropColumn("unread_count_user");
      table.dropColumn("admin_last_read_at");
      table.dropColumn("user_last_read_at");
    });
};
