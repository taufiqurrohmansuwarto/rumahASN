const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class DocumentReviews extends Model {
  static get tableName() {
    return "rasn_naskah.document_reviews";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const Documents = require("@/models/rasn-naskah/documents.model");
    const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
    const ReviewIssues = require("@/models/rasn-naskah/review-issues.model");
    const SuperiorPreferences = require("@/models/rasn-naskah/superior-preferences.model");

    return {
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: Documents,
        join: {
          from: "rasn_naskah.document_reviews.document_id",
          to: "rasn_naskah.documents.id",
        },
      },
      version: {
        relation: Model.BelongsToOneRelation,
        modelClass: DocumentVersions,
        join: {
          from: "rasn_naskah.document_reviews.document_version_id",
          to: "rasn_naskah.document_versions.id",
        },
      },
      issues: {
        relation: Model.HasManyRelation,
        modelClass: ReviewIssues,
        join: {
          from: "rasn_naskah.document_reviews.id",
          to: "rasn_naskah.review_issues.review_id",
        },
      },
      targetSuperior: {
        relation: Model.BelongsToOneRelation,
        modelClass: SuperiorPreferences,
        join: {
          from: "rasn_naskah.document_reviews.target_superior_id",
          to: "rasn_naskah.superior_preferences.id",
        },
      },
    };
  }

  static get jsonAttributes() {
    return [
      "score_breakdown",
      "matched_rules",
      "ai_suggestions_structured",
      "superior_style_suggestions",
    ];
  }

  static get modifiers() {
    return {
      byDocument(query, documentId) {
        query.where("document_id", documentId);
      },
      byStatus(query, status) {
        query.where("status", status);
      },
      completed(query) {
        query.where("status", "completed");
      },
      pending(query) {
        query.where("status", "pending");
      },
      processing(query) {
        query.where("status", "processing");
      },
      orderByRecent(query) {
        query.orderBy("created_at", "desc");
      },
      withIssues(query) {
        query.withGraphFetched("issues");
      },
      withIssuesSummary(query) {
        query.select(
          "rasn_naskah.document_reviews.*",
          DocumentReviews.relatedQuery("issues")
            .where("severity", "critical")
            .count()
            .as("critical_count"),
          DocumentReviews.relatedQuery("issues")
            .where("severity", "major")
            .count()
            .as("major_count"),
          DocumentReviews.relatedQuery("issues")
            .where("severity", "minor")
            .count()
            .as("minor_count")
        );
      },
    };
  }

  // Update status to processing
  async markAsProcessing() {
    return DocumentReviews.query()
      .patchAndFetchById(this.id, { status: "processing" });
  }

  // Mark as completed with results
  async markAsCompleted(results) {
    const {
      ai_review,
      ai_summary,
      ai_suggestions,
      ai_suggestions_structured,
      superior_style_suggestions,
      includes_superior_analysis,
      score,
      score_breakdown,
      total_issues,
      critical_issues,
      major_issues,
      minor_issues,
      matched_rules,
      processing_time_ms,
    } = results;

    return DocumentReviews.query().patchAndFetchById(this.id, {
      status: "completed",
      ai_review,
      ai_summary,
      ai_suggestions,
      ai_suggestions_structured,
      superior_style_suggestions,
      includes_superior_analysis: includes_superior_analysis || false,
      score,
      score_breakdown,
      total_issues,
      critical_issues,
      major_issues,
      minor_issues,
      matched_rules,
      processing_time_ms,
    });
  }

  // Mark as failed
  async markAsFailed(errorMessage) {
    return DocumentReviews.query().patchAndFetchById(this.id, {
      status: "failed",
      error_message: errorMessage,
    });
  }
}

module.exports = DocumentReviews;

