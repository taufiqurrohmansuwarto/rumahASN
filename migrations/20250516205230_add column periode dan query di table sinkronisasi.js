/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("sinkronisasi", (table) => {
    table.string("periode");
    table.text("query");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("sinkronisasi", (table) => {
    table.dropColumn("periode");
    table.dropColumn("query");
  });
};
