/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .table("operator_gaji_pw", (table) => {
      table.timestamp("locked_at").nullable();
      table.string("locked_by").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .table("operator_gaji_pw", (table) => {
      table.dropColumn("locked_at");
      table.dropColumn("locked_by");
    });
};
