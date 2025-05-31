// migrations/20250531120000_fix_attachments_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .alterTable("attachments", function (table) {
      // 1. Drop existing foreign key constraint (try both possible names)
      try {
        table.dropForeign(["email_id"], "attachments_email_id_foreign");
      } catch (e) {
        // Jika nama constraint berbeda, coba drop tanpa nama
        table.dropForeign(["email_id"]);
      }

      // 2. Make email_id nullable untuk temporary uploads
      table.string("email_id", 255).nullable().alter();

      // 3. Add new columns untuk upload functionality
      table
        .string("uploaded_by", 255)
        .nullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("SET NULL");

      table
        .enum("upload_status", ["uploading", "completed", "failed"])
        .defaultTo("completed");

      table.text("upload_error").nullable();

      // 4. Add file_path untuk store MinIO path (untuk deletion)
      table.text("file_path").nullable();

      // 5. Re-add email_id foreign key dengan nullable
      table
        .foreign("email_id")
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");

      // 6. Add indexes untuk performa
      table.index("uploaded_by", "idx_attachments_uploaded_by");
      table.index("upload_status", "idx_attachments_upload_status");
      table.index(["uploaded_by", "email_id"], "idx_attachments_user_email");
      table.index(
        ["email_id", "upload_status"],
        "idx_attachments_email_status"
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .alterTable("attachments", function (table) {
      // Remove indexes dengan nama yang spesifik
      table.dropIndex([], "idx_attachments_email_status");
      table.dropIndex([], "idx_attachments_user_email");
      table.dropIndex([], "idx_attachments_upload_status");
      table.dropIndex([], "idx_attachments_uploaded_by");

      // Remove foreign keys
      table.dropForeign(["email_id"]);
      table.dropForeign(["uploaded_by"]);

      // Remove new columns
      table.dropColumn("file_path");
      table.dropColumn("upload_error");
      table.dropColumn("upload_status");
      table.dropColumn("uploaded_by");

      // Restore email_id as not nullable dengan foreign key
      table.string("email_id", 255).notNullable().alter();
      table
        .foreign("email_id")
        .references("id")
        .inTable("rasn_mail.emails")
        .onDelete("CASCADE");
    });
};
