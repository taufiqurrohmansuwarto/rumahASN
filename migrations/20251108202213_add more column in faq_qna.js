/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.transaction(async (trx) => {
    // Add new columns
    await trx.schema.table("faq_qna", (table) => {
      // Versioning
      table.integer("version").defaultTo(1);
      table.integer("previous_version_id");

      // Metadata
      table.specificType("tags", "TEXT[]");
      table.float("confidence_score").defaultTo(1.0);
      // Qdrant reference
      table.uuid("qdrant_point_id").unique();
    });

    // Add foreign key constraints
    await trx.schema.alterTable("faq_qna", (table) => {
      table
        .foreign("sub_category_id")
        .references("id")
        .inTable("sub_categories")
        .onDelete("SET NULL");

      table
        .foreign("previous_version_id")
        .references("id")
        .inTable("faq_qna")
        .onDelete("SET NULL");
    });

    // Add check constraints
    await trx.raw(`
        ALTER TABLE faq_qna 
        ADD CONSTRAINT valid_date_check 
        CHECK (expired_date IS NULL OR expired_date > effective_date)
    `);

    await trx.raw(`
        ALTER TABLE faq_qna 
        ADD CONSTRAINT confidence_score_check 
        CHECK (confidence_score >= 0 AND confidence_score <= 1)
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
