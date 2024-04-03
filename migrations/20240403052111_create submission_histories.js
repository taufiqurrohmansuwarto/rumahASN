/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("submission_histories", (table) => {
    table.increments("id").primary();
    table.string("submission_id").notNullable();
    table.string("user_id");
    table.text("notes");
    table
      .foreign("submission_id")
      .references("submissions.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.jsonb("old_data");
    table.jsonb("new_data");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("submission_histories");
};
