/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("sapa_asn")
    .createTable("pendampingan", (table) => {
      table.string("id").primary();
      table.string("user_id");
      table.string("no_hp_user");
      table.string("email_user");
      table.string("jenis_perkara");
      table.text("ringkasan_perkara");
      table.string("lampiran_dokumen");
      table.string("bentuk_pendampingan");
      table.string("alasan_tolak");
      table.boolean("is_penyampaian_hukum").defaultTo(false);
      table.string("fasilitator_id");
      table.timestamps(true, true);
      table
        .foreign("user_id")
        .references("custom_id")
        .inTable("public.users")
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
  return knex.schema.withSchema("sapa_asn").dropTable("pendampingan");
};
