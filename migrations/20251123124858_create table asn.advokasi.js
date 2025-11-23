/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("sapa_asn").createTable("advokasi", (table) => {
    table.string("id").primary();
    table.string("user_id");
    table.string("no_hp_user");
    table.string("email_user");
    table.string("kategori_isu");
    table.boolean("is_sensitive").defaultTo(false);
    table.text("poin_konsultasi");
    table.boolean("is_persetujuan").defaultTo(false);
    table.string("status");
    table.string("alasan_tolak");
    table.boolean("is_penyampaian_hukum").defaultTo(false);
    table.string("jadwal_id");
    table.string("fasilitator_id");
    table.timestamps(true, true);
    table
      .foreign("user_id")
      .references("custom_id")
      .inTable("public.users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("jadwal_id")
      .references("id")
      .inTable("sapa_asn.jadwal")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("fasilitator_id")
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
  return knex.schema.withSchema("asn").dropTable("advokasi");
};
