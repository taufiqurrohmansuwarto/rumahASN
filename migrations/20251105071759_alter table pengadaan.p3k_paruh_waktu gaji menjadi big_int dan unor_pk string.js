/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("p3k_paruh_waktu", (table) => {
      table.bigInteger("gaji").alter();
      table.string("unor_pk");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .alterTable("p3k_paruh_waktu", (table) => {
      table.string("gaji").alter();
      table.string("unor_pk").alter();
    });
};
