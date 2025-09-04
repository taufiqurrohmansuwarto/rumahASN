/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("knowledge_ai_metadata", (table) => {
      // content quality & analysis
      table.integer("ai_readability_score");
      table.decimal("ai_sentiment_score");
      table.integer("ai_quality_score");
      table.integer("ai_completeness_score");
      // smart categorization
      table.string("ai_suggested_category");
      table.decimal("ai_confidence_score");
      table.jsonb("ai_tags");
      table.jsonb("ai_related_content");
      // content enhancement
      table.jsonb("ai_suggestions");
      table.jsonb("ai_seo_keywords");
      table.text("ai_meta_description");
      // procoessing status
      table.string("processing_status");
      table.text("error_message");
      table.string("model_version");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("knowledge_ai_metadata", (table) => {
      table.dropColumn("ai_readability_score");
      table.dropColumn("ai_sentiment_score");
      table.dropColumn("ai_quality_score");
      table.dropColumn("ai_completeness_score");
      table.dropColumn("ai_suggested_category");
      table.dropColumn("ai_confidence_score");
      table.dropColumn("ai_tags");
      table.dropColumn("ai_related_content");
      table.dropColumn("ai_suggestions");
      table.dropColumn("ai_seo_keywords");
      table.dropColumn("ai_meta_description");
      table.dropColumn("processing_status");
      table.dropColumn("error_message");
      table.dropColumn("model_version");
    });
};
