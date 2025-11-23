/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .createTable("konsultasi_hukum_thread", (table) => {
      table.string("id").primary();
      table.string("konsultasi_hukum_id");
      table.string("user_id");
      table.string("message");
      table.timestamps(true, true);
      table
        .foreign("konsultasi_hukum_id")
        .references("id")
        .inTable("sapa_asn.konsultasi_hukum")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .foreign("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .dropTable("konsultasi_hukum_thread");
};
