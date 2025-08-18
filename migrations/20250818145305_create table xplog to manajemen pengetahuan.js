/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // buat schema knowledge, cek dulu schema nya exist atau tidak
    await trx.schema.raw(`CREATE SCHEMA IF NOT EXISTS knowledge`);

    return trx.schema.withSchema("knowledge").createTable("xp_log", (table) => {
      table.string("id").primary();
      table
        .string("user_id")
        .references("custom_id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("action");
      table.string("ref_type");
      table.string("ref_id");
      table.integer("xp");
      table.string("season_code");
      table.timestamps(true, true);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    await trx.schema.withSchema("knowledge").dropTableIfExists("xp_log");
  });
};
