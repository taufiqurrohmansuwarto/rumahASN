/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("discussions", (table) => {
    table.uuid("id").primary();
    table.string("title");
    table.string("subtitle");
    table.text("content");
    table.string("created_by");
    table.foreign("created_by").references("users.custom_id");
    table.uuid("discussion_id");
    table.string("type").defaultTo("thread");
    table
      .foreign("discussion_id")
      .references("discussions.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.timestamps(true, true);
    table.timestamp("deleted_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("discussions");
};
