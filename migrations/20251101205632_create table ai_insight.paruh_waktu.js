/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS "ai_insight"`)
    .then(() => {
      return knex.schema
        .withSchema("ai_insight")
        .createTable("paruh_waktu", (table) => {
          table.string("id").primary();
          table.string("source_id").unique();
          table.jsonb("metadata");
          table.jsonb("data");
          table.jsonb("result");
          table.string("user_id");
          table.timestamps(true, true);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`DROP TABLE IF EXISTS ai_insight.paruh_waktu.insight`);
};
