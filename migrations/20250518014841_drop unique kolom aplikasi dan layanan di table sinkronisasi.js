/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sinkronisasi", (table) => {
    table.dropUnique(["aplikasi", "layanan"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sinkronisasi", (table) => {
    table.unique(["aplikasi", "layanan"]);
  });
};
