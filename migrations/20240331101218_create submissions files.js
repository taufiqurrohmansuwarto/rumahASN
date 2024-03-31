/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("submission_file_ref", (table) => {
    table.string("kode").primary();
    table.text("description");
    table.boolean("is_active").defaultTo(true);
    table.boolean("is_primary").defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("submission_file_ref");
};
