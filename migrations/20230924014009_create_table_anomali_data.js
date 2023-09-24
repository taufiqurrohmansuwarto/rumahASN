/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("anomali_data_2022", (table) => {
    table.increments("id").primary();
    table.string("nip");
    table.string("jenis_anomali");
    table.string("user_id");
    table.string("status").defaultTo("belum_diperbaiki");
    table.foreign("user_id").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("anomali_data_2022");
};
