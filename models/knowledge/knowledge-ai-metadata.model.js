const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeKnowledgeAiMetadata extends Model {
  static get tableName() {
    return "knowledge.knowledge_ai_metadata";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get modifiers() {
    return {
      // PUBLIC ACCESS - Safe fields for everyone
      publicSelect(query) {
        query.select(
          'id',
          'content_id',
          'ai_summary',
          'ai_keywords',
          'ai_tags',
          'ai_related_content',
          'ai_seo_keywords',
          'ai_meta_description',
          'ai_target_audience',
          'ai_estimated_read_time',
          'ai_content_type_detected',
          'ai_semantic_concepts',
          'ai_topic_clusters'
        );
      },

      // AUTHOR ACCESS - Public fields + performance metrics + improvement insights
      authorSelect(query) {
        query.select(
          'id',
          'content_id',
          'ai_summary',
          'ai_keywords',
          'ai_tags',
          'ai_related_content',
          'ai_seo_keywords',
          'ai_meta_description',
          'ai_target_audience',
          'ai_estimated_read_time',
          'ai_content_complexity',
          'ai_content_type_detected',
          'ai_readability_score',
          'ai_quality_score',
          'ai_completeness_score',
          'ai_engagement_score',
          'ai_shareability_score',
          'ai_bookmark_probability',
          'ai_suggestions',
          'ai_suggested_category',
          'ai_confidence_score',
          'ai_missing_elements',
          'ai_improvement_priority',
          'ai_content_gaps',
          'ai_semantic_concepts',
          'ai_topic_clusters',
          'ai_freshness_score',
          'ai_update_needed_score',
          'ai_content_lifecycle_stage'
        );
      },

      // ADMIN ACCESS - All fields including technical data and quality metrics
      adminSelect(query) {
        query.select(
          'id',
          'content_id',
          'ai_summary',
          'ai_keywords',
          'ai_tags',
          'ai_related_content',
          'ai_seo_keywords',
          'ai_meta_description',
          'ai_target_audience',
          'ai_estimated_read_time',
          'ai_content_complexity',
          'ai_content_type_detected',
          'ai_readability_score',
          'ai_quality_score',
          'ai_completeness_score',
          'ai_engagement_score',
          'ai_shareability_score',
          'ai_bookmark_probability',
          'ai_suggestions',
          'ai_suggested_category',
          'ai_confidence_score',
          'ai_sentiment_score',
          'ai_missing_elements',
          'ai_improvement_priority',
          'ai_content_gaps',
          'ai_semantic_concepts',
          'ai_entity_extraction',
          'ai_topic_clusters',
          'ai_freshness_score',
          'ai_update_needed_score',
          'ai_content_lifecycle_stage',
          'ai_fact_accuracy_score',
          'ai_objectivity_score',
          'ai_evidence_quality',
          'ai_embedding',
          'processing_status',
          'error_message',
          'model_version',
          'last_processed',
          'last_updated_at',
          'created_at',
          'updated_at'
        );
      },

      // Filter by processing status
      completed(query) {
        query.where('processing_status', 'completed');
      },

      // Filter by processing status failed
      failed(query) {
        query.where('processing_status', 'failed');
      },

      // Filter by processing status pending
      pending(query) {
        query.where('processing_status', 'pending');
      },

      // Filter by content IDs
      byContentIds(query, contentIds) {
        query.whereIn('content_id', contentIds);
      },

      // Filter by quality score range
      qualityScoreRange(query, minScore, maxScore) {
        query.whereBetween('ai_quality_score', [minScore, maxScore || 100]);
      },

      // Filter by confidence score
      highConfidence(query, threshold = 0.8) {
        query.where('ai_confidence_score', '>=', threshold);
      },

      // Recent processing
      recentlyProcessed(query, days = 7) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        query.where('last_processed', '>=', date);
      }
    };
  }

  static get relationMappings() {
    const knowledgeContent = require("@/models/knowledge/contents.model");
    return {
      knowledgeContent: {
        relation: Model.BelongsToOneRelation,
        modelClass: knowledgeContent,
        join: {
          from: "knowledge.knowledge_ai_metadata.content_id",
          to: "knowledge.contents.id",
        },
      },
    };
  }
}

module.exports = knowledgeKnowledgeAiMetadata;
