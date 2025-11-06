/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .createTable("audit_log", (table) => {
      table.increments("id").primary();
      table.string("table_name");
      table.string("record_id");
      table.string("action");
      table.jsonb("old_data");
      table.jsonb("new_data");
      table.string("change_by");
      table.timestamp("change_at").defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("pengadaan").dropTable("audit_log");
};
