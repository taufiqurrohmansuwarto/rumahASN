/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // buat schema knowledge, cek dulu schema nya exist atau tidak
    await trx.schema.raw(`CREATE SCHEMA IF NOT EXISTS knowledge`);

    /**CREATE TABLE knowledge_ai_metadata (
  id              SERIAL PRIMARY KEY,
  content_id      INT NOT NULL REFERENCES knowledge_content(id) ON DELETE CASCADE,
  ai_summary      TEXT,          -- ringkasan AI (TL;DR)
  ai_keywords     TEXT[],        -- kata kunci AI
  ai_embedding    DOUBLE PRECISION[],  -- simpan embedding sebagai float8[] (tanpa ekstensi)
  last_processed  TIMESTAMP NOT NULL DEFAULT NOW()
);
 */

    return trx.schema
      .withSchema("knowledge")
      .createTable("knowledge_ai_metadata", (table) => {
        table.string("id").primary();
        table
          .string("content_id")
          .references("id")
          .inTable("knowledge.contents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.text("ai_summary");
        table.jsonb("ai_keywords");
        table.specificType("ai_embedding", "float8[]");
        table.dateTime("last_processed").defaultTo(knex.fn.now());
        table.dateTime("last_updated_at").defaultTo(knex.fn.now());
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
      `DROP TABLE IF EXISTS knowledge.knowledge_ai_metadata`
    );
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
