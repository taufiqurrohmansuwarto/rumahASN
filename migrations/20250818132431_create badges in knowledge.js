/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // buat schema knowledge, cek dulu schema nya exist atau tidak
    await trx.schema.raw(`CREATE SCHEMA IF NOT EXISTS knowledge`);

    return trx.schema.withSchema("knowledge").createTable("badges", (table) => {
      table.string("id").primary();
      table.string("name");
      table.string("description");
      table.string("icon_url");
      table.integer("points_required");
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
    await trx.schema.raw(`DROP TABLE IF EXISTS knowledge.badges`);
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
