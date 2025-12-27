const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Documents extends Model {
  static get tableName() {
    return "rasn_naskah.documents";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Templates = require("@/models/rasn-naskah/templates.model");
    const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
    const DocumentReviews = require("@/models/rasn-naskah/document-reviews.model");
    const DocumentAttachments = require("@/models/rasn-naskah/document-attachments.model");
    const Bookmarks = require("@/models/rasn-naskah/bookmarks.model");
    const DocumentActivities = require("@/models/rasn-naskah/document-activities.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.documents.user_id",
          to: "users.custom_id",
        },
      },
      template: {
        relation: Model.BelongsToOneRelation,
        modelClass: Templates,
        join: {
          from: "rasn_naskah.documents.template_id",
          to: "rasn_naskah.templates.id",
        },
      },
      versions: {
        relation: Model.HasManyRelation,
        modelClass: DocumentVersions,
        join: {
          from: "rasn_naskah.documents.id",
          to: "rasn_naskah.document_versions.document_id",
        },
      },
      reviews: {
        relation: Model.HasManyRelation,
        modelClass: DocumentReviews,
        join: {
          from: "rasn_naskah.documents.id",
          to: "rasn_naskah.document_reviews.document_id",
        },
      },
      attachments: {
        relation: Model.HasManyRelation,
        modelClass: DocumentAttachments,
        join: {
          from: "rasn_naskah.documents.id",
          to: "rasn_naskah.document_attachments.document_id",
        },
      },
      bookmarks: {
        relation: Model.HasManyRelation,
        modelClass: Bookmarks,
        join: {
          from: "rasn_naskah.documents.id",
          to: "rasn_naskah.bookmarks.document_id",
        },
      },
      activities: {
        relation: Model.HasManyRelation,
        modelClass: DocumentActivities,
        join: {
          from: "rasn_naskah.documents.id",
          to: "rasn_naskah.document_activities.document_id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      byUser(query, userId) {
        query.where("user_id", userId);
      },
      byStatus(query, status) {
        query.where("status", status);
      },
      byCategory(query, category) {
        query.where("category", category);
      },
      notArchived(query) {
        query.whereNot("status", "archived");
      },
      withLatestReview(query) {
        query.withGraphFetched("reviews(latest)").modifiers({
          latest(builder) {
            builder.orderBy("created_at", "desc").limit(1);
          },
        });
      },
      orderByRecent(query) {
        query.orderBy("created_at", "desc");
      },
      simpleSelect(query) {
        query.select(
          "id",
          "title",
          "category",
          "status",
          "latest_score",
          "created_at",
          "updated_at"
        );
      },
    };
  }

  // Check if user is owner
  isOwner(userId) {
    return this.user_id === userId;
  }

  // Get latest version
  async getLatestVersion() {
    const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
    return DocumentVersions.query()
      .where("document_id", this.id)
      .orderBy("version_number", "desc")
      .first();
  }

  // Create new version
  async createVersion(content, userId, changeSummary = null) {
    const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
    
    const latestVersion = await this.getLatestVersion();
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    const version = await DocumentVersions.query().insert({
      document_id: this.id,
      version_number: newVersionNumber,
      content,
      change_summary: changeSummary,
      created_by: userId,
    });

    // Update revision count
    await Documents.query()
      .findById(this.id)
      .patch({ revision_count: newVersionNumber });

    return version;
  }
}

module.exports = Documents;

