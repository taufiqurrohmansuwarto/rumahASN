/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("socmed_audits", (table) => {
    table.string("id").primary();
    table.string("table_name");
    table.string("record_id");
    table.string("action_type");
    table.timestamp("action_time");
    table.string("user_id");
    table.jsonb("old_value");
    table.jsonb("new_value");
    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("socmed_audits");
};
