/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("submissions_files", (table) => {
    table.increments("id").primary();
    table.string("kode_file");
    table
      .foreign("kode_file")
      .references("submissions_file_refs.kode")
      .onDelete("CASCADE")
      .onDelete("CASCADE");
    table.string("submission_ref");
    table
      .foreign("submission_ref")
      .references("submissions_references.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.unique(["kode_file", "submission_ref"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("submissions_files");
};
