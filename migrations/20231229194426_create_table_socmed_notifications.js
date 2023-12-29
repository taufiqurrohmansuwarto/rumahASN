/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("socmed_notifications", (table) => {
    table.string("id").primary();
    table.string("user_id");
    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("trigger_user_id");
    table
      .foreign("trigger_user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("type");
    table.string("reference_id");
    table.boolean("is_read").defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("socmed_notifications");
};
