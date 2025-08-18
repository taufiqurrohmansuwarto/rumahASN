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
      .createTable("user_points", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .references("custom_id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.integer("points");
        table.integer("levels").defaultTo(1);
        table.dateTime("last_updated_at");
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
    await trx.schema.raw(`DROP TABLE IF EXISTS knowledge.user_points`);
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
