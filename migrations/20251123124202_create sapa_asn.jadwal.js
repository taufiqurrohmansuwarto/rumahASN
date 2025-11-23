/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("sapa_asn").createTable("jadwal", (table) => {
    table.string("id").primary();
    table.date("tanggal_konsultasi");
    table.time("waktu_mulai").defaultTo("00:00:00");
    table.time("waktu_selesai").defaultTo("23:59:59");
    table.integer("kuota_maksimal").defaultTo(3);
    table.integer("kuota_terisi").defaultTo(0);
    table.string("status");
    table.time("batas_daftar");
    table.timestamps(true, true);
    table.string("fasilitator_id");
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
  return knex.schema.withSchema("sapa_asn").dropTable("jadwal");
};
