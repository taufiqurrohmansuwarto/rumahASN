const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class ReviewIssues extends Model {
  static get tableName() {
    return "rasn_naskah.review_issues";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const DocumentReviews = require("@/models/rasn-naskah/document-reviews.model");
    const PergubRules = require("@/models/rasn-naskah/pergub-rules.model");

    return {
      review: {
        relation: Model.BelongsToOneRelation,
        modelClass: DocumentReviews,
        join: {
          from: "rasn_naskah.review_issues.review_id",
          to: "rasn_naskah.document_reviews.id",
        },
      },
      related_rule: {
        relation: Model.BelongsToOneRelation,
        modelClass: PergubRules,
        join: {
          from: "rasn_naskah.review_issues.related_rule_id",
          to: "rasn_naskah.pergub_rules.id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      byReview(query, reviewId) {
        query.where("review_id", reviewId);
      },
      bySeverity(query, severity) {
        query.where("severity", severity);
      },
      byCategory(query, category) {
        query.where("category", category);
      },
      critical(query) {
        query.where("severity", "critical");
      },
      major(query) {
        query.where("severity", "major");
      },
      minor(query) {
        query.where("severity", "minor");
      },
      suggestion(query) {
        query.where("severity", "suggestion");
      },
      unresolved(query) {
        query.where("is_resolved", false);
      },
      resolved(query) {
        query.where("is_resolved", true);
      },
      autoFixable(query) {
        query.where("is_auto_fixable", true);
      },
      orderBySeverity(query) {
        query.orderByRaw(`
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'major' THEN 2
            WHEN 'minor' THEN 3
            WHEN 'suggestion' THEN 4
          END
        `);
      },
      // Select untuk tampilan list (tanpa content besar)
      forList(query) {
        query.select(
          "id",
          "review_id",
          "severity",
          "category",
          "original_text",
          "suggested_text",
          "description",
          "rule_reference",
          "is_auto_fixable",
          "is_resolved",
          "created_at"
        );
      },
    };
  }

  // Helper untuk mendapatkan label severity dalam bahasa Indonesia
  get severityLabel() {
    const labels = {
      critical: "Kritis",
      major: "Penting",
      minor: "Minor",
      suggestion: "Saran",
    };
    return labels[this.severity] || this.severity;
  }

  // Helper untuk mendapatkan label category dalam bahasa Indonesia
  get categoryLabel() {
    const labels = {
      format: "Format",
      grammar: "Tata Bahasa",
      spelling: "Ejaan",
      structure: "Struktur",
      consistency: "Konsistensi",
      terminology: "Terminologi",
      style: "Gaya Bahasa",
      regulation: "Regulasi",
      other: "Lainnya",
    };
    return labels[this.category] || this.category;
  }

  // Helper untuk mendapatkan warna berdasarkan severity
  get severityColor() {
    const colors = {
      critical: "red",
      major: "orange",
      minor: "gold",
      suggestion: "blue",
    };
    return colors[this.severity] || "default";
  }

  // Mark as resolved
  async resolve() {
    return ReviewIssues.query().patchAndFetchById(this.id, { is_resolved: true });
  }

  // Bulk create issues dengan field baru
  static async bulkCreate(reviewId, issues) {
    const issuesData = issues.map((issue) => ({
      review_id: reviewId,
      severity: issue.severity,
      category: issue.category,
      issue_text: issue.issue_text || issue.context,
      description: issue.description || issue.message,
      suggestion: issue.suggestion,
      original_text: issue.original_text || issue.context,
      suggested_text: issue.suggested_text || issue.suggestion,
      rule_reference: issue.rule_reference || issue.ruleReference,
      context_before: issue.context_before,
      context_after: issue.context_after,
      is_auto_fixable: issue.is_auto_fixable || false,
      line_number: issue.line_number,
      start_position: issue.start_position,
      end_position: issue.end_position,
      related_rule_id: issue.related_rule_id,
      is_resolved: false,
    }));

    return ReviewIssues.query().insert(issuesData);
  }

  // Get issues grouped by category for UI
  static async getGroupedByCategory(reviewId) {
    const issues = await ReviewIssues.query()
      .where("review_id", reviewId)
      .modify("orderBySeverity");

    const grouped = {
      format: [],
      penulisan: [], // grammar + spelling + style
      saran: [], // suggestion severity
    };

    for (const issue of issues) {
      if (issue.severity === "suggestion") {
        grouped.saran.push(issue);
      } else if (["grammar", "spelling", "style", "terminology"].includes(issue.category)) {
        grouped.penulisan.push(issue);
      } else {
        grouped.format.push(issue);
      }
    }

    return grouped;
  }
}

module.exports = ReviewIssues;

