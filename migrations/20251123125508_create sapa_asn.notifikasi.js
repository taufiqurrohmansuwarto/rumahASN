/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .createTable("notifikasi", (table) => {
      table.string("id").primary();
      table.string("user_id");
      table.string("judul");
      table.text("pesan");
      table.string("layanan");
      table.boolean("is_read").defaultTo(false);
      table
        .foreign("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("reference_id");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("sapa_asn").dropTable("notifikasi");
};
