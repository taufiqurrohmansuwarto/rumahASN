/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("cc_meetings", (table) => {
    table.string("id").primary();
    table.string("title");
    table.string("description");
    table.string("meeting_id");
    table.string("status");
    table.dateTime("start_time");
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
