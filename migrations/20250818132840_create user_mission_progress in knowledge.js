/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // buat schema knowledge, cek dulu schema nya exist atau tidak
    await trx.schema.raw(`CREATE SCHEMA IF NOT EXISTS knowledge`);

    return trx.schema
      .withSchema("knowledge")
      .createTable("user_mission_progress", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .references("custom_id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("mission_id")
          .references("id")
          .inTable("knowledge.missions")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("status").defaultTo("in_progress");
        table.datetime("completed_at");
        table.unique(["user_id", "mission_id", "status"]);
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
    await trx.schema.raw(
      `DROP TABLE IF EXISTS knowledge.user_mission_progress`
    );
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
