/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("signify").createTable("audit_log", (table) => {
    table.string("id").primary();
    table
      .string("letter_id")
      .references("id")
      .inTable("signify.letters")
      .onDelete("CASCADE");
    // misal 'submitted'
    table.string("action");
    table.string("performed_by");
    table.string("ip_address");
    table.text("description");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("signify").dropTable("audit_log");
};
