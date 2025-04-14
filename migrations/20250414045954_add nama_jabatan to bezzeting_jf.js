/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("bezzeting_jf", (table) => {
    table.string("nama_jabatan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("bezzeting_jf", (table) => {
    table.dropColumn("nama_jabatan");
  });
};
