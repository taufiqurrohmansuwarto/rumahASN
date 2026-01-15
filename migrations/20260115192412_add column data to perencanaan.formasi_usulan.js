/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("perencanaan.formasi_usulan", function (table) {
    table.jsonb("data_usulan").notNullable().defaultTo("[]");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("perencanaan.formasi_usulan", function (table) {
    table.dropColumn("data_usulan");
  });
};
