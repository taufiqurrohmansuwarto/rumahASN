/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS pendataan_fasilitator`)
    .then(() => {
      return knex.schema
        .withSchema("pendataan_fasilitator")
        .createTable("fasilitator", (table) => {
          table.increments("id").primary();
          table.bigInteger("asn_id");
          table.string("skpd_id");
          table.string("jenis_kepegawaian");
          table.string("nama");
          table.string("tipe_pengelola");
          table.timestamps(true, true);
        });
    })
    .then(() => {
      return knex.schema.alterTable(
        "pendataan_fasilitator.fasilitator",
        (table) => {
          table
            .foreign("asn_id")
            .references("sync_pegawai.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
          table
            .foreign("skpd_id")
            .references("sync_unor_master.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
        }
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("pendataan_fasilitator")
    .dropTableIfExists("fasilitator")
    .then(() => {
      return knex.schema.raw(`DROP SCHEMA IF EXISTS pendataan_fasilitator`);
    });
};
