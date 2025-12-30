/**
 * Migration: Create cc_video_sessions table
 * Untuk tracking active video conference sessions dengan persistence
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("cc_video_sessions", (table) => {
    table.string("id").primary();

    table
      .string("user_id")
      .notNullable()
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .string("meeting_id")
      .notNullable()
      .references("id")
      .inTable("cc_meetings")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Role: consultant atau participant
    table
      .enu("role", ["consultant", "participant"], {
        useNative: true,
        enumName: "cc_video_session_role",
      })
      .notNullable();

    // Status: active, ended, disconnected
    table
      .enu("status", ["active", "ended", "disconnected"], {
        useNative: true,
        enumName: "cc_video_session_status",
      })
      .notNullable()
      .defaultTo("active");

    // Timestamps
    table.timestamp("joined_at").defaultTo(knex.fn.now());
    table.timestamp("ended_at");
    table.timestamp("last_heartbeat").defaultTo(knex.fn.now());

    // Indexes for faster queries
    table.index("user_id");
    table.index("meeting_id");
    table.index("status");
    table.index("last_heartbeat");

    // Composite index for common query pattern
    table.index(["user_id", "status"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("cc_video_sessions")
    .then(() => knex.raw('DROP TYPE IF EXISTS "cc_video_session_role"'))
    .then(() => knex.raw('DROP TYPE IF EXISTS "cc_video_session_status"'));
};
