/**
 * Migration: Create Kanban Schema and All Tables
 * Fitur Kanban Board untuk manajemen project internal
 *
 * Tables:
 * 1. kanban.projects - Project utama
 * 2. kanban.project_members - Member project dengan role
 * 3. kanban.project_watchers - Pemantau project
 * 4. kanban.columns - Kolom/status kanban
 * 5. kanban.tasks - Task/card utama
 * 6. kanban.subtasks - Subtask dari task
 * 7. kanban.labels - Master label per project
 * 8. kanban.task_labels - Relasi task-label (many-to-many)
 * 9. kanban.task_attachments - File lampiran task
 * 10. kanban.task_comments - Komentar pada task
 * 11. kanban.task_activities - Log aktivitas untuk tracking
 * 12. kanban.time_entries - Time tracking entries
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // 1. Create schema kanban
    await trx.raw("CREATE SCHEMA IF NOT EXISTS kanban");

    // 2. Create projects table
    await trx.schema.withSchema("kanban").createTable("projects", (table) => {
      table.string("id").primary();
      table.string("name").notNullable();
      table.text("description");
      table.string("icon").defaultTo("📋"); // emoji untuk project
      table.string("color").defaultTo("#3B82F6"); // warna theme project
      table.enum("visibility", ["private", "team"]).defaultTo("private");
      table.boolean("is_archived").defaultTo(false);
      table
        .string("created_by")
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.timestamps(true, true);
    });

    // 3. Create project_members table
    await trx.schema
      .withSchema("kanban")
      .createTable("project_members", (table) => {
        table.string("id").primary();
        table
          .string("project_id")
          .notNullable()
          .references("id")
          .inTable("kanban.projects")
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
          .enum("role", ["owner", "admin", "member"])
          .defaultTo("member")
          .notNullable();
        table.timestamps(true, true);

        // Unique constraint: 1 user hanya bisa jadi 1 member per project
        table.unique(["project_id", "user_id"]);
      });

    // 4. Create project_watchers table
    await trx.schema
      .withSchema("kanban")
      .createTable("project_watchers", (table) => {
        table.string("id").primary();
        table
          .string("project_id")
          .notNullable()
          .references("id")
          .inTable("kanban.projects")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.boolean("can_comment").defaultTo(true);
        table.boolean("can_view_reports").defaultTo(true);
        table.timestamps(true, true);

        // Unique constraint
        table.unique(["project_id", "user_id"]);
      });

    // 5. Create columns table
    await trx.schema.withSchema("kanban").createTable("columns", (table) => {
      table.string("id").primary();
      table
        .string("project_id")
        .notNullable()
        .references("id")
        .inTable("kanban.projects")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("name").notNullable();
      table.string("color").defaultTo("#6B7280");
      table.integer("position").defaultTo(0);
      table.boolean("is_done_column").defaultTo(false); // untuk menandai kolom "selesai"
      table.integer("wip_limit").nullable(); // Work In Progress limit
      table.timestamps(true, true);
    });

    // 6. Create tasks table
    await trx.schema.withSchema("kanban").createTable("tasks", (table) => {
      table.string("id").primary();
      table.string("task_number").notNullable(); // format: PRJ-001
      table
        .string("project_id")
        .notNullable()
        .references("id")
        .inTable("kanban.projects")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .string("column_id")
        .notNullable()
        .references("id")
        .inTable("kanban.columns")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("title").notNullable();
      table.text("description");
      table
        .enum("priority", ["low", "medium", "high", "urgent"])
        .defaultTo("medium");
      table.date("start_date").nullable();
      table.date("due_date").nullable();
      table.decimal("estimated_hours", 10, 2).nullable();
      table.decimal("actual_hours", 10, 2).defaultTo(0);
      table.integer("position").defaultTo(0);
      table
        .string("assigned_to")
        .nullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      table
        .string("created_by")
        .notNullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.timestamp("completed_at").nullable();
      table.timestamps(true, true);

      // Index untuk pencarian
      table.index(["project_id", "column_id"]);
      table.index(["assigned_to"]);
      table.index(["due_date"]);
    });

    // 7. Create subtasks table
    await trx.schema.withSchema("kanban").createTable("subtasks", (table) => {
      table.string("id").primary();
      table
        .string("task_id")
        .notNullable()
        .references("id")
        .inTable("kanban.tasks")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("title").notNullable();
      table.boolean("is_completed").defaultTo(false);
      table.timestamp("completed_at").nullable();
      table
        .string("completed_by")
        .nullable()
        .references("custom_id")
        .inTable("public.users")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      table.integer("position").defaultTo(0);
      table.timestamps(true, true);
    });

    // 8. Create labels table
    await trx.schema.withSchema("kanban").createTable("labels", (table) => {
      table.string("id").primary();
      table
        .string("project_id")
        .notNullable()
        .references("id")
        .inTable("kanban.projects")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("name").notNullable();
      table.string("color").defaultTo("#3B82F6");
      table.timestamps(true, true);

      // Unique label name per project
      table.unique(["project_id", "name"]);
    });

    // 9. Create task_labels table (many-to-many)
    await trx.schema
      .withSchema("kanban")
      .createTable("task_labels", (table) => {
        table.string("id").primary();
        table
          .string("task_id")
          .notNullable()
          .references("id")
          .inTable("kanban.tasks")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("label_id")
          .notNullable()
          .references("id")
          .inTable("kanban.labels")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);

        // Unique constraint
        table.unique(["task_id", "label_id"]);
      });

    // 10. Create task_attachments table
    await trx.schema
      .withSchema("kanban")
      .createTable("task_attachments", (table) => {
        table.string("id").primary();
        table
          .string("task_id")
          .notNullable()
          .references("id")
          .inTable("kanban.tasks")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("filename").notNullable();
        table.string("file_path").notNullable();
        table.integer("file_size").defaultTo(0);
        table.string("file_type").nullable();
        table
          .string("uploaded_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);
      });

    // 11. Create task_comments table
    await trx.schema
      .withSchema("kanban")
      .createTable("task_comments", (table) => {
        table.string("id").primary();
        table
          .string("task_id")
          .notNullable()
          .references("id")
          .inTable("kanban.tasks")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.text("content").notNullable();
        table.jsonb("mentions").nullable(); // array of user_ids yang di-mention
        table.boolean("is_edited").defaultTo(false);
        table.timestamps(true, true);

        table.index(["task_id", "created_at"]);
      });

    // 12. Create task_activities table (activity log)
    await trx.schema
      .withSchema("kanban")
      .createTable("task_activities", (table) => {
        table.string("id").primary();
        table
          .string("task_id")
          .notNullable()
          .references("id")
          .inTable("kanban.tasks")
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
          .enum("action", [
            "created",
            "updated",
            "moved",
            "assigned",
            "unassigned",
            "priority_changed",
            "due_date_changed",
            "completed",
            "reopened",
            "comment_added",
            "attachment_added",
            "subtask_added",
            "subtask_completed",
            "label_added",
            "label_removed",
            "time_logged",
          ])
          .notNullable();
        table.jsonb("old_value").nullable();
        table.jsonb("new_value").nullable();
        table.text("description").nullable(); // human readable description
        table.timestamps(true, true);

        table.index(["task_id", "created_at"]);
      });

    // 13. Create time_entries table
    await trx.schema
      .withSchema("kanban")
      .createTable("time_entries", (table) => {
        table.string("id").primary();
        table
          .string("task_id")
          .notNullable()
          .references("id")
          .inTable("kanban.tasks")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.decimal("hours", 10, 2).notNullable();
        table.text("description").nullable();
        table.date("logged_date").notNullable();
        table.timestamps(true, true);

        table.index(["task_id", "logged_date"]);
        table.index(["user_id", "logged_date"]);
      });

    // Create indexes for better query performance
    await trx.raw(`
      CREATE INDEX idx_kanban_tasks_search 
      ON kanban.tasks USING gin(to_tsvector('indonesian', coalesce(title, '') || ' ' || coalesce(description, '')))
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    // Drop all tables in reverse order (karena foreign key dependencies)
    await trx.schema.withSchema("kanban").dropTableIfExists("time_entries");
    await trx.schema.withSchema("kanban").dropTableIfExists("task_activities");
    await trx.schema.withSchema("kanban").dropTableIfExists("task_comments");
    await trx.schema.withSchema("kanban").dropTableIfExists("task_attachments");
    await trx.schema.withSchema("kanban").dropTableIfExists("task_labels");
    await trx.schema.withSchema("kanban").dropTableIfExists("labels");
    await trx.schema.withSchema("kanban").dropTableIfExists("subtasks");
    await trx.schema.withSchema("kanban").dropTableIfExists("tasks");
    await trx.schema.withSchema("kanban").dropTableIfExists("columns");
    await trx.schema.withSchema("kanban").dropTableIfExists("project_watchers");
    await trx.schema.withSchema("kanban").dropTableIfExists("project_members");
    await trx.schema.withSchema("kanban").dropTableIfExists("projects");

    // Drop schema
    await trx.raw("DROP SCHEMA IF EXISTS kanban CASCADE");
  });
};
