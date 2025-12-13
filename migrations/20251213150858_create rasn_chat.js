/**
 * Migration: Create RASN Chat Schema and All Tables
 * Fitur Chat seperti Slack dengan integrasi Kanban dan Email
 *
 * Tables:
 * 1. rasn_chat.workspace_roles - Master roles workspace
 * 2. rasn_chat.workspace_members - User dengan role workspace
 * 3. rasn_chat.channel_roles - Master roles channel
 * 4. rasn_chat.channels - Ruang diskusi (public/private/direct)
 * 5. rasn_chat.channel_members - Anggota channel dengan role
 * 6. rasn_chat.messages - Pesan dengan support thread
 * 7. rasn_chat.reactions - Emoji reactions
 * 8. rasn_chat.mentions - @user dan @channel
 * 9. rasn_chat.attachments - File dan voice messages
 * 10. rasn_chat.user_presence - Status online/offline
 * 11. rasn_chat.pinned_messages - Pesan yang di-pin
 * 12. rasn_chat.video_calls - Integrasi Jitsi
 * 13. rasn_chat.call_participants - Peserta video call
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // 1. Create schema rasn_chat
    await trx.raw("CREATE SCHEMA IF NOT EXISTS rasn_chat");

    // ============================================
    // ROLES SYSTEM
    // ============================================

    // 2. Create workspace_roles table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("workspace_roles", (table) => {
        table.string("id").primary();
        table.string("name").notNullable().unique();
        table.text("description");
        table.jsonb("permissions").defaultTo("{}");
        table.boolean("is_default").defaultTo(false);
        table.timestamps(true, true);
      });

    // 3. Create workspace_members table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("workspace_members", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("role_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.workspace_roles")
          .onDelete("RESTRICT")
          .onUpdate("CASCADE");
        table.boolean("is_active").defaultTo(true);
        table.timestamp("joined_at").defaultTo(trx.fn.now());
        table.timestamps(true, true);

        // Unique: 1 user hanya punya 1 workspace membership
        table.unique(["user_id"]);
      });

    // 4. Create channel_roles table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("channel_roles", (table) => {
        table.string("id").primary();
        table.string("name").notNullable().unique();
        table.text("description");
        table.jsonb("permissions").defaultTo("{}");
        table.integer("level").defaultTo(10); // hierarchy: owner=100, admin=80, mod=50, member=10
        table.timestamps(true, true);
      });

    // ============================================
    // CHANNEL & MESSAGING
    // ============================================

    // 5. Create channels table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("channels", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.text("description");
        table.string("icon").defaultTo("💬"); // emoji icon
        table.enum("type", ["public", "private", "direct"]).defaultTo("public");

        // Integrasi dengan Kanban Project (opsional)
        table
          .string("kanban_project_id")
          .nullable()
          .references("id")
          .inTable("kanban.projects")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");

        table.boolean("is_archived").defaultTo(false);
        table
          .string("created_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);

        // Index untuk pencarian
        table.index(["type", "is_archived"]);
      });

    // 6. Create channel_members table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("channel_members", (table) => {
        table.string("id").primary();
        table
          .string("channel_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.channels")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("role_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.channel_roles")
          .onDelete("RESTRICT")
          .onUpdate("CASCADE");

        // Notification settings
        table.boolean("muted").defaultTo(false);
        table
          .enum("notification_pref", ["all", "mentions", "none"])
          .defaultTo("all");

        // Tracking
        table.timestamp("last_read_at").nullable();
        table.timestamp("joined_at").defaultTo(trx.fn.now());
        table.timestamps(true, true);

        // Unique: 1 user hanya bisa jadi 1 member per channel
        table.unique(["channel_id", "user_id"]);
        table.index(["user_id"]);
      });

    // 7. Create messages table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("messages", (table) => {
        table.string("id").primary();
        table
          .string("channel_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.channels")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        // Thread support (reply to message)
        table
          .string("parent_id")
          .nullable()
          .references("id")
          .inTable("rasn_chat.messages")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");
        table.integer("thread_count").defaultTo(0); // Denormalized untuk performa

        // Content
        table.text("content").notNullable();
        table
          .enum("content_type", ["text", "file", "voice", "system"])
          .defaultTo("text");

        // Integrasi dengan Kanban Task
        table
          .string("linked_task_id")
          .nullable()
          .references("id")
          .inTable("kanban.tasks")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");

        // Integrasi dengan Email
        table
          .string("linked_email_id", 25)
          .nullable()
          .references("id")
          .inTable("rasn_mail.emails")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");

        // Status
        table.boolean("is_edited").defaultTo(false);
        table.timestamp("edited_at").nullable();
        table.boolean("is_deleted").defaultTo(false);

        table.timestamps(true, true);

        // Indexes untuk performa
        table.index(["channel_id", "created_at"]);
        table.index(["parent_id"]);
        table.index(["linked_task_id"]);
        table.index(["linked_email_id"]);
      });

    // 8. Create reactions table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("reactions", (table) => {
        table.string("id").primary();
        table
          .string("message_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.messages")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("emoji", 10).notNullable();
        table.timestamps(true, true);

        // Unique: 1 user hanya bisa 1 emoji per message
        table.unique(["message_id", "user_id", "emoji"]);
        table.index(["message_id"]);
      });

    // 9. Create mentions table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("mentions", (table) => {
        table.string("id").primary();
        table
          .string("message_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.messages")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("mentioned_user_id")
          .nullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE"); // NULL jika @channel atau @everyone
        table
          .enum("mention_type", ["user", "channel", "everyone"])
          .notNullable();
        table.boolean("is_read").defaultTo(false);
        table.timestamps(true, true);

        table.index(["mentioned_user_id", "is_read"]);
      });

    // 10. Create attachments table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("attachments", (table) => {
        table.string("id").primary();
        table
          .string("message_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.messages")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        // File info
        table.string("file_name", 255).notNullable();
        table.string("file_type", 50).nullable();
        table.integer("file_size").defaultTo(0);
        table.string("file_url", 500).notNullable();
        table.string("thumbnail_url", 500).nullable();

        // Attachment category
        table
          .enum("attachment_type", [
            "file",
            "image",
            "video",
            "voice",
            "document",
          ])
          .defaultTo("file");

        // Voice message specific
        table.integer("duration").nullable(); // durasi dalam detik
        table.text("waveform_data").nullable(); // JSON array untuk visualisasi
        table.text("transcription").nullable(); // hasil speech-to-text

        // Preview
        table.text("preview_data").nullable(); // blur hash atau base64 preview

        // Metadata tambahan
        table.jsonb("metadata").nullable();

        table.timestamps(true, true);

        table.index(["message_id"]);
        table.index(["attachment_type"]);
      });

    // 11. Create user_presence table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("user_presence", (table) => {
        table
          .string("user_id")
          .primary()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .enum("status", ["online", "away", "busy", "offline"])
          .defaultTo("offline");
        table.string("status_text", 100).nullable();
        table.string("status_emoji", 10).nullable();
        table.timestamp("last_seen").defaultTo(trx.fn.now());
        table.timestamps(true, true);
      });

    // 12. Create pinned_messages table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("pinned_messages", (table) => {
        table.string("id").primary();
        table
          .string("channel_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.channels")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("message_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.messages")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("pinned_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamp("pinned_at").defaultTo(trx.fn.now());

        // Unique: 1 message hanya bisa di-pin 1x per channel
        table.unique(["channel_id", "message_id"]);
      });

    // ============================================
    // VIDEO CALL (JITSI)
    // ============================================

    // 13. Create video_calls table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("video_calls", (table) => {
        table.string("id").primary();
        table
          .string("channel_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.channels")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        // Jitsi room info
        table.string("room_name", 100).notNullable();
        table.string("room_password", 50).nullable();

        // Call info
        table.enum("call_type", ["voice", "video"]).defaultTo("video");
        table.string("title", 200).nullable();

        // Status
        table.enum("status", ["active", "ended"]).defaultTo("active");
        table
          .string("started_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamp("started_at").defaultTo(trx.fn.now());
        table.timestamp("ended_at").nullable();

        // Stats
        table.integer("max_participants").defaultTo(0);

        table.timestamps(true, true);

        table.index(["channel_id", "status"]);
      });

    // 14. Create call_participants table
    await trx.schema
      .withSchema("rasn_chat")
      .createTable("call_participants", (table) => {
        table.string("id").primary();
        table
          .string("call_id")
          .notNullable()
          .references("id")
          .inTable("rasn_chat.video_calls")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamp("joined_at").defaultTo(trx.fn.now());
        table.timestamp("left_at").nullable();
        table.integer("total_duration").defaultTo(0); // dalam detik

        table.index(["call_id"]);
        table.index(["user_id"]);
      });

    // ============================================
    // FULLTEXT SEARCH INDEX
    // ============================================
    await trx.raw(`
      CREATE INDEX idx_rasn_chat_messages_search 
      ON rasn_chat.messages 
      USING gin(to_tsvector('indonesian', coalesce(content, '')))
    `);

    // ============================================
    // SEED DATA: WORKSPACE ROLES
    // ============================================
    await trx("rasn_chat.workspace_roles").insert([
      {
        id: "ws-role-superadmin",
        name: "superadmin",
        description:
          "Super Administrator dengan akses penuh ke seluruh sistem chat",
        permissions: JSON.stringify({
          all: true,
          can_create_channel: true,
          can_delete_channel: true,
          can_manage_users: true,
          can_manage_roles: true,
          can_view_analytics: true,
          can_broadcast: true,
          can_access_admin_panel: true,
        }),
        is_default: false,
      },
      {
        id: "ws-role-admin",
        name: "admin",
        description:
          "Administrator workspace dengan kemampuan mengelola channel dan user",
        permissions: JSON.stringify({
          can_create_channel: true,
          can_delete_channel: false,
          can_manage_users: true,
          can_manage_roles: false,
          can_view_analytics: true,
          can_broadcast: true,
          can_access_admin_panel: true,
        }),
        is_default: false,
      },
      {
        id: "ws-role-member",
        name: "member",
        description: "Member biasa dengan akses standar",
        permissions: JSON.stringify({
          can_create_channel: false,
          can_delete_channel: false,
          can_manage_users: false,
          can_manage_roles: false,
          can_view_analytics: false,
          can_broadcast: false,
          can_access_admin_panel: false,
        }),
        is_default: true,
      },
    ]);

    // ============================================
    // SEED DATA: CHANNEL ROLES
    // ============================================
    await trx("rasn_chat.channel_roles").insert([
      {
        id: "ch-role-owner",
        name: "owner",
        description: "Pemilik channel dengan kontrol penuh",
        permissions: JSON.stringify({
          all: true,
          can_send_message: true,
          can_delete_any_message: true,
          can_pin_message: true,
          can_invite_member: true,
          can_kick_member: true,
          can_edit_channel: true,
          can_delete_channel: true,
          can_mute_user: true,
          can_start_call: true,
          can_manage_roles: true,
        }),
        level: 100,
      },
      {
        id: "ch-role-admin",
        name: "admin",
        description: "Admin channel dengan kemampuan mengelola member",
        permissions: JSON.stringify({
          can_send_message: true,
          can_delete_any_message: true,
          can_pin_message: true,
          can_invite_member: true,
          can_kick_member: true,
          can_edit_channel: true,
          can_delete_channel: false,
          can_mute_user: true,
          can_start_call: true,
          can_manage_roles: false,
        }),
        level: 80,
      },
      {
        id: "ch-role-moderator",
        name: "moderator",
        description: "Moderator dengan kemampuan moderasi pesan",
        permissions: JSON.stringify({
          can_send_message: true,
          can_delete_any_message: true,
          can_pin_message: true,
          can_invite_member: false,
          can_kick_member: false,
          can_edit_channel: false,
          can_delete_channel: false,
          can_mute_user: true,
          can_start_call: true,
          can_manage_roles: false,
        }),
        level: 50,
      },
      {
        id: "ch-role-member",
        name: "member",
        description: "Anggota biasa dengan akses standar",
        permissions: JSON.stringify({
          can_send_message: true,
          can_delete_any_message: false,
          can_pin_message: false,
          can_invite_member: false,
          can_kick_member: false,
          can_edit_channel: false,
          can_delete_channel: false,
          can_mute_user: false,
          can_start_call: true,
          can_manage_roles: false,
        }),
        level: 10,
      },
    ]);

    // ============================================
    // SEED DATA: DEFAULT SUPERADMIN
    // ============================================
    const { nanoid } = require("nanoid");
    await trx("rasn_chat.workspace_members").insert({
      id: nanoid(),
      user_id: "master|56543",
      role_id: "ws-role-superadmin",
      is_active: true,
      joined_at: new Date().toISOString(),
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    // Drop all tables in reverse order (karena foreign key dependencies)
    await trx.schema
      .withSchema("rasn_chat")
      .dropTableIfExists("call_participants");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("video_calls");
    await trx.schema
      .withSchema("rasn_chat")
      .dropTableIfExists("pinned_messages");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("user_presence");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("attachments");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("mentions");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("reactions");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("messages");
    await trx.schema
      .withSchema("rasn_chat")
      .dropTableIfExists("channel_members");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("channels");
    await trx.schema.withSchema("rasn_chat").dropTableIfExists("channel_roles");
    await trx.schema
      .withSchema("rasn_chat")
      .dropTableIfExists("workspace_members");
    await trx.schema
      .withSchema("rasn_chat")
      .dropTableIfExists("workspace_roles");

    // Drop schema
    await trx.raw("DROP SCHEMA IF EXISTS rasn_chat CASCADE");
  });
};
