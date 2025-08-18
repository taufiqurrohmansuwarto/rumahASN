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
      .createTable("missions", (table) => {
        table.string("id").primary();
        table.string("title");
        table.text("description");
        table.string("frequency").defaultTo("daily");
        table.integer("points_reward");
        table.datetime("start_date");
        table.datetime("end_date");
        table.boolean("is_active").defaultTo(true);
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
    await trx.schema.raw(`DROP TABLE IF EXISTS knowledge.missions`);
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
