/**
 * Migration: Add Task Assignees Table
 * Support multiple assignees per task
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // Create task_assignees table for many-to-many relationship
    await trx.schema
      .withSchema("kanban")
      .createTable("task_assignees", (table) => {
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
          .string("assigned_by")
          .nullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");
        table.timestamp("assigned_at").defaultTo(knex.fn.now());
        table.timestamps(true, true);

        // Unique constraint: 1 user hanya bisa di-assign 1x per task
        table.unique(["task_id", "user_id"]);
      });

    // Create indexes for better query performance
    await trx.raw(`
      CREATE INDEX idx_task_assignees_task_id ON kanban.task_assignees(task_id);
      CREATE INDEX idx_task_assignees_user_id ON kanban.task_assignees(user_id);
    `);

    // Migrate existing assigned_to data to new table
    await trx.raw(`
      INSERT INTO kanban.task_assignees (id, task_id, user_id, assigned_at, created_at, updated_at)
      SELECT 
        gen_random_uuid()::text,
        id,
        assigned_to,
        created_at,
        created_at,
        updated_at
      FROM kanban.tasks
      WHERE assigned_to IS NOT NULL
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    // Drop indexes
    await trx.raw(`
      DROP INDEX IF EXISTS kanban.idx_task_assignees_task_id;
      DROP INDEX IF EXISTS kanban.idx_task_assignees_user_id;
    `);

    // Drop table
    await trx.schema.withSchema("kanban").dropTableIfExists("task_assignees");
  });
};
