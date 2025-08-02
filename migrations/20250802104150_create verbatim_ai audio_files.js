/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("verbatim_ai")
    .createTable("audio_files", (table) => {
      table.string("id").primary();
      table.string("session_id");
      table
        .foreign("session_id")
        .references("id")
        .inTable("verbatim_ai.sessions")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.integer("part_number");
      table.text("file_path");
      table.integer("durasi");
      table.text("status_trankrip");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("verbatim_ai").dropTable("audio_files");
};
