/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("submissions", (table) => {
    table.string("id").primary();
    table.string("submitter");
    table
      .foreign("submitter")
      .references("users.custom_id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("operator");
    table
      .foreign("operator")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.string("submission_reference_id");
    table
      .foreign("submission_reference_id")
      .references("submissions_references.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("employee_number");
    table.specificType("additional_documents", "text ARRAY");
    table.string("status");
    table.text("notes");
    table.jsonb("data");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("submissions");
};
