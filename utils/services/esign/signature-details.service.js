/**
 * Esign Signature Details Service (REFACTORED)
 * Main entry point - exports all signature-related functions
 */

// Import dashboard queries
export {
  getPendingDocuments,
  getMarkedForTteDocuments,
  getRejectedDocuments,
  getCompletedDocuments,
} from "./dashboard-queries.service";

// Import workflow actions
export {
  signDocument,
  reviewDocument,
  markForTte,
  rejectDocument,
  updateSignaturePosition,
  getDocumentHistory,
} from "./signature-actions.service";

// Import workflow helpers
export {
  validateSignatureDetailAction,
  checkAndCompleteRequest,
  getStatusLabel,
  countMarkedDocuments,
} from "./workflow-helpers.service";

// Import user activity logging
export {
  logUserActivity,
  logSignatureAction,
  logDocumentAction,
  logSignatureRequestAction,
  getUserActivityLogs,
  getEntityActivityLogs,
} from "./user-activity.service";

// Import BSrE services
export {
  logBsreInteraction,
  callBsreWithLogging,
  getBsreLogs,
} from "./bsre.services";
