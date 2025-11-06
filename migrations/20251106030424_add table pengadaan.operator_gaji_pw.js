/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("pengadaan")
    .createTable("operator_gaji_pw", (table) => {
      table.increments("id").primary();
      table.string("unor_id");
      table.string("user_id");
      table.unique(["unor_id", "user_id"]);
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("pengadaan").dropTable("operator_gaji_pw");
};
