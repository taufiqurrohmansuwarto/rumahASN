/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("statistik")
    .createTable("asn_gender", (table) => {
      table.increments("id").primary();
      table.string("unor_id");
      table.integer("jumlah_pria");
      table.integer("jumlah_wanita");
      table.integer("jumlah_total");
      table.string("status");
      table.boolean("is_cpns").defaultTo(false);
      table.datetime("tanggal");
      table.string("created_at");
      table.string("updated_at");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("statistik").dropTableIfExists("asn_gender");
};
