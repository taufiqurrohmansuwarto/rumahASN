/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.table("cc_meetings", function (table) {
    table.text("deskripsi").alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.table("cc_meetings", function (table) {
    table.string("deskripsi").alter();
  });
};
