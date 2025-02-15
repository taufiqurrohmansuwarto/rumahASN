/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("signify")
    .createTable("escalations", (table) => {
      table.string("id").primary();
      table
        .string("letter_id")
        .references("id")
        .inTable("signify.letters")
        .onDelete("CASCADE");
      table
        .string("workflow_id")
        .references("id")
        .inTable("signify.letter_workflow")
        .onDelete("CASCADE");
      table.string("escalated_from");
      table.string("escalated_to");
      table.text("reason");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("signify").dropTable("escalations");
};
