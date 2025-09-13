/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("knowledge_ai_metadata", (table) => {
      table.string("ai_target_audience");
      table.integer("ai_estimated_read_time");
      table.integer("ai_content_complexity");
      table.string("ai_content_type_detected");

      table.integer("ai_engagement_score");
      table.integer("ai_shareability_score");
      table.decimal("ai_bookmark_probability", 5, 2);
      table.jsonb("ai_missing_elements");
      table.jsonb("ai_improvement_priority");
      table.jsonb("ai_content_gaps");

      table.jsonb("ai_semantic_concepts");
      table.jsonb("ai_entity_extraction");
      table.jsonb("ai_topic_clusters");

      table.integer("ai_freshness_score");
      table.integer("ai_update_needed_score");
      table.string("ai_content_lifecycle_stage");

      table.integer("ai_fact_accuracy_score");
      table.integer("ai_objectivity_score");
      table.integer("ai_evidence_quality");
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
      table.dropColumn("ai_target_audience");
      table.dropColumn("ai_estimated_read_time");
      table.dropColumn("ai_content_complexity");
      table.dropColumn("ai_content_type_detected");
      table.dropColumn("ai_engagement_score");

      table.dropColumn("ai_shareability_score");
      table.dropColumn("ai_bookmark_probability");
      table.dropColumn("ai_missing_elements");
      table.dropColumn("ai_improvement_priority");
      table.dropColumn("ai_content_gaps");
      table.dropColumn("ai_semantic_concepts");
      table.dropColumn("ai_entity_extraction");
      table.dropColumn("ai_topic_clusters");

      table.dropColumn("ai_freshness_score");
      table.dropColumn("ai_update_needed_score");
      table.dropColumn("ai_content_lifecycle_stage");

      table.dropColumn("ai_fact_accuracy_score");
      table.dropColumn("ai_objectivity_score");
      table.dropColumn("ai_evidence_quality");
    });
};
