/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("signify").createTable("comments", (table) => {
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
      .onDelete("SET NULL");
    table
      .string("commented_by")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("comment");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("signify").dropTable("comments");
};
