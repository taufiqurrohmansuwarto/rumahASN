/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS letter_managements`)
    .then(() => {
      return knex.schema
        .withSchema("letter_managements")
        .createTable("headers", (table) => {
          table.string("id").primary();
          table.string("skpd_id");
          table.string("nama_instansi");
          table.string("nama_perangkat_daerah");
          table.string("alamat");
          table.string("telepon");
          table.string("laman_web");
          table.string("email");
          table.string("user_id");
          table
            .foreign("user_id")
            .references("users.custom_id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
          table.timestamps(true, true);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
