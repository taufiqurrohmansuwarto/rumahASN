/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("signify")
    .createTable("letter_workflow", (table) => {
      table.string("id").primary();
      table
        .string("letter_id")
        .references("id")
        .inTable("signify.letters")
        .onDelete("CASCADE");
      table.integer("step_order");
      table.string("role");
      table.string("assigned_to");
      table.string("status").defaultTo("pending");
      table.text("comments");
      table.timestamp("deadline");
      table.timestamp("signed_at");
      table.string("reassigned_from");
      table.string("escalated_to");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("signify").dropTable("letter_workflow");
};
