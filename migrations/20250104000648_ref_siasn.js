/**
 * create table ref_jft
(
    id             varchar(255) not null
        primary key,
    mingol_id      integer,
    maxgol_id      integer,
    nama           varchar(255),
    bup_usia       integer,
    bobot          integer,
    kel_jabatan_id varchar(255),
    cepat_kode     varchar(255),
    ncistime       timestamp with time zone,
    jenis          varchar(255),
    cepat_kode_new varchar(255),
    status         varchar(255),
    jenjang        varchar(255)
);
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`CREATE SCHEMA IF NOT EXISTS ref_siasn`).then(() => {
    return knex.schema.withSchema("ref_siasn").createTable("jft", (table) => {
      table.string("id").primary();
      table.integer("mingol_id");
      table.integer("maxgol_id");
      table.string("nama");
      table.integer("bup_usia");
      table.integer("bobot");
      table.string("kel_jabatan_id");
      table.string("cepat_kode");
      table.timestamp("ncistime");
      table.string("jenis");
      table.string("cepat_kode_new");
      table.string("status");
      table.string("jenjang");
      table.timestamps(true, true);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
