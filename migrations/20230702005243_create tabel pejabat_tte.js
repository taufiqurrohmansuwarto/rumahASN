/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("pejabat_tte", (table) => {
    table.string("custom_id").primary();
    table.foreign("custom_id").references("users.custom_id");
    table.string("nik");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("pejabat_tte");
};
