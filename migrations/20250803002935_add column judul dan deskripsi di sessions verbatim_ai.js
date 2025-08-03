/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("verbatim_ai")
    .alterTable("sessions", (table) => {
      table.string("judul").nullable();
      table.text("deskripsi").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("verbatim_ai")
    .alterTable("sessions", (table) => {
      table.dropColumn("judul");
      table.dropColumn("deskripsi");
    });
};
