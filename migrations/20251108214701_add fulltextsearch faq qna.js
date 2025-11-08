/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.transaction(async (trx) => {
    // Add search_vector column with generated tsvector
    await trx.raw(`
      ALTER TABLE faq_qna 
      ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('indonesian', 
          COALESCE(question, '') || ' ' || COALESCE(answer, '')
        )
      ) STORED
    `);

    // Create GIN index for full-text search
    await trx.raw(`
      CREATE INDEX idx_faq_qna_search_vector ON faq_qna USING gin(search_vector)
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  return knex.transaction(async (trx) => {
    // Drop index first
    await trx.raw(`
      DROP INDEX IF EXISTS idx_faq_qna_search_vector
    `);

    // Drop column
    await trx.raw(`
      ALTER TABLE faq_qna 
      DROP COLUMN IF EXISTS search_vector
    `);
  });
};
