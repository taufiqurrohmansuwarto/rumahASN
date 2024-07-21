/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("standar_pelayanan", (table) => {
    table.string("id").primary();
    table.string("nama_pelayanan");
    table.text("persyaratan");
    table.text("mekanisme");
    table.text("dasar_hukum");
    table.text("waktu");
    table.string("definisi");
    table.text("biaya");
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("standar_pelayanan");
};
