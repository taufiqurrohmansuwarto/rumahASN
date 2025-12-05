/**
 * Migration: Add Link Attachment Support
 * Add fields to support link attachments
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("kanban")
    .alterTable("task_attachments", (table) => {
      // Add attachment type: 'file' or 'link'
      table
        .enum("attachment_type", ["file", "link"])
        .defaultTo("file")
        .after("filename");
      // Add file_url for link attachments
      table.text("file_url").nullable().after("attachment_type");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("kanban")
    .alterTable("task_attachments", (table) => {
      table.dropColumn("attachment_type");
      table.dropColumn("file_url");
    });
};

