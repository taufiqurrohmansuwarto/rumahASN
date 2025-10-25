/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("tte_submission")
    .alterTable("email_pegawai", (table) => {
      table.unique("nip");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("tte_submission")
    .alterTable("email_pegawai", (table) => {
      table.dropUnique("nip");
    });
};
