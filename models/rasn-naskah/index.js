// RASN Naskah Models - Index file
// Export all models for easy import

const Pergub = require("./pergub.model");
const PergubRules = require("./pergub-rules.model");
const Templates = require("./templates.model");
const UserPreferences = require("./user-preferences.model");
const Documents = require("./documents.model");
const DocumentVersions = require("./document-versions.model");
const DocumentReviews = require("./document-reviews.model");
const ReviewIssues = require("./review-issues.model");
const DocumentAttachments = require("./document-attachments.model");
const Bookmarks = require("./bookmarks.model");
const DocumentActivities = require("./document-activities.model");
const SuperiorPreferences = require("./superior-preferences.model");

module.exports = {
  Pergub,
  PergubRules,
  Templates,
  UserPreferences,
  Documents,
  DocumentVersions,
  DocumentReviews,
  ReviewIssues,
  DocumentAttachments,
  Bookmarks,
  DocumentActivities,
  SuperiorPreferences,
};

