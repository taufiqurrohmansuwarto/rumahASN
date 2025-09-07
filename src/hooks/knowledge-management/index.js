// Knowledge Management Hooks Export Index

// Main content hooks
export { useAdminContents } from "./useAdminContents";
export { default as useAdminContentDetail } from "./useAdminContentDetail";

// Categories and references
export { default as useCategories } from "./useCategories";
export { default as useBadges } from "./useBadges";
export { default as useMissions } from "./useMissions";

// Comments and interactions
export { default as useComments } from "./useComments";
export { default as useRelatedContent } from "./useRelatedContent";

// Gamification
export * from "./useGamification";

// Dashboard and insights
export { default as useKnowledgeDashboard } from "./use-knowledge-dashboard";
export { default as useKnowledgeInsights } from "./useKnowledgeInsights";

// Revision Management
export * from "./useRevisions";

// User Content Management
export * from "./useUserContent";

// Notification Management
export * from "./useNotifications";
export * from "./useAdminNotifications";