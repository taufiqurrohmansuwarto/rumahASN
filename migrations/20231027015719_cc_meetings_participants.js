/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("cc_meetings_participants", (table) => {
    table.string("id").primary();
    table.string("meeting_id");
    table.string("user_id");
    table
      .foreign("meeting_id")
      .references("cc_meetings.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.unique(["meeting_id", "user_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
