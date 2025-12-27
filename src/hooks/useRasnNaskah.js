import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocuments,
  getDocumentDetail,
  getBookmarks,
  getTemplates,
  getTemplateDetail,
  getTemplateCategories,
  getPreferences,
  getLanguageStyles,
  getReviewStats,
  getDocumentReview,
  getDocumentVersions,
  getDocumentActivities,
  getPergubList,
  getPergubDetail,
  getPergubRules,
  getRuleTypes,
  // Superior preferences
  getSuperiorPreferences,
  getSuperiorPreference,
  createSuperiorPreference,
  updateSuperiorPreference,
  deleteSuperiorPreference,
  // Review
  getReviewIssues,
  getReviewIssuesGrouped,
  requestReviewWithOptions,
  resolveIssue,
  bulkResolveIssues,
  // User preferences
  getUsersWithPreferences,
} from "@/services/rasn-naskah.services";

// Documents hooks
export const useRasnNaskahDocuments = (params = {}) => {
  return useQuery({
    queryKey: ["rasn-naskah-documents", params],
    queryFn: () => getDocuments(params),
    keepPreviousData: true,
  });
};

export const useRasnNaskahDocumentDetail = (documentId) => {
  return useQuery({
    queryKey: ["rasn-naskah-document", documentId],
    queryFn: () => getDocumentDetail(documentId),
    enabled: !!documentId,
  });
};

export const useRasnNaskahDocumentReview = (documentId) => {
  return useQuery({
    queryKey: ["rasn-naskah-review", documentId],
    queryFn: () => getDocumentReview(documentId),
    enabled: !!documentId,
  });
};

export const useRasnNaskahDocumentVersions = (documentId) => {
  return useQuery({
    queryKey: ["rasn-naskah-versions", documentId],
    queryFn: () => getDocumentVersions(documentId),
    enabled: !!documentId,
  });
};

export const useRasnNaskahDocumentActivities = (documentId) => {
  return useQuery({
    queryKey: ["rasn-naskah-activities", documentId],
    queryFn: () => getDocumentActivities(documentId),
    enabled: !!documentId,
  });
};

// Bookmarks hooks
export const useRasnNaskahBookmarks = () => {
  return useQuery({
    queryKey: ["rasn-naskah-bookmarks"],
    queryFn: () => getBookmarks(),
  });
};

// Templates hooks
export const useRasnNaskahTemplates = (params = {}) => {
  return useQuery({
    queryKey: ["rasn-naskah-templates", params],
    queryFn: () => getTemplates(params),
    keepPreviousData: true,
  });
};

export const useRasnNaskahTemplateDetail = (templateId) => {
  return useQuery({
    queryKey: ["rasn-naskah-template", templateId],
    queryFn: () => getTemplateDetail(templateId),
    enabled: !!templateId,
  });
};

export const useRasnNaskahTemplateCategories = () => {
  return useQuery({
    queryKey: ["rasn-naskah-template-categories"],
    queryFn: () => getTemplateCategories(),
  });
};

// Preferences hooks
export const useRasnNaskahPreferences = () => {
  return useQuery({
    queryKey: ["rasn-naskah-preferences"],
    queryFn: () => getPreferences(),
  });
};

export const useRasnNaskahLanguageStyles = () => {
  return useQuery({
    queryKey: ["rasn-naskah-language-styles"],
    queryFn: () => getLanguageStyles(),
  });
};

// Review stats hooks
export const useRasnNaskahReviewStats = () => {
  return useQuery({
    queryKey: ["rasn-naskah-review-stats"],
    queryFn: () => getReviewStats(),
  });
};

// Admin hooks
export const useRasnNaskahPergubList = (params = {}) => {
  return useQuery({
    queryKey: ["rasn-naskah-pergub", params],
    queryFn: () => getPergubList(params),
    keepPreviousData: true,
  });
};

export const useRasnNaskahPergubDetail = (pergubId) => {
  return useQuery({
    queryKey: ["rasn-naskah-pergub-detail", pergubId],
    queryFn: () => getPergubDetail(pergubId),
    enabled: !!pergubId,
  });
};

export const useRasnNaskahPergubRules = (pergubId, params = {}) => {
  return useQuery({
    queryKey: ["rasn-naskah-pergub-rules", pergubId, params],
    queryFn: () => getPergubRules(pergubId, params),
    enabled: !!pergubId,
    keepPreviousData: true,
  });
};

export const useRasnNaskahRuleTypes = () => {
  return useQuery({
    queryKey: ["rasn-naskah-rule-types"],
    queryFn: () => getRuleTypes(),
  });
};

// ==========================================
// SUPERIOR PREFERENCES HOOKS
// ==========================================

export const useRasnNaskahSuperiorPreferences = () => {
  return useQuery({
    queryKey: ["rasn-naskah-superiors"],
    queryFn: () => getSuperiorPreferences(),
  });
};

export const useRasnNaskahSuperiorPreference = (superiorId) => {
  return useQuery({
    queryKey: ["rasn-naskah-superior", superiorId],
    queryFn: () => getSuperiorPreference(superiorId),
    enabled: !!superiorId,
  });
};

export const useCreateSuperiorPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSuperiorPreference,
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-superiors"]);
    },
  });
};

export const useUpdateSuperiorPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSuperiorPreference,
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-superiors"]);
    },
  });
};

export const useDeleteSuperiorPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSuperiorPreference,
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-superiors"]);
    },
  });
};

// ==========================================
// REVIEW ISSUES HOOKS
// ==========================================

export const useRasnNaskahReviewIssues = (reviewId, params = {}) => {
  return useQuery({
    queryKey: ["rasn-naskah-review-issues", reviewId, params],
    queryFn: () => getReviewIssues(reviewId, params),
    enabled: !!reviewId,
  });
};

export const useRasnNaskahReviewIssuesGrouped = (reviewId) => {
  return useQuery({
    queryKey: ["rasn-naskah-review-issues-grouped", reviewId],
    queryFn: () => getReviewIssuesGrouped(reviewId),
    enabled: !!reviewId,
  });
};

export const useRequestReviewWithOptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, options }) => requestReviewWithOptions(documentId, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["rasn-naskah-document", variables.documentId]);
      queryClient.invalidateQueries(["rasn-naskah-review", variables.documentId]);
      queryClient.invalidateQueries(["rasn-naskah-documents"]);
    },
  });
};

export const useResolveIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveIssue,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["rasn-naskah-review-issues", variables.reviewId]);
      queryClient.invalidateQueries(["rasn-naskah-review-issues-grouped", variables.reviewId]);
    },
  });
};

export const useBulkResolveIssues = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkResolveIssues,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["rasn-naskah-review-issues", variables.reviewId]);
      queryClient.invalidateQueries(["rasn-naskah-review-issues-grouped", variables.reviewId]);
    },
  });
};

// ==========================================
// USER PREFERENCES FOR TARGETING
// ==========================================

export const useRasnNaskahUsersWithPreferences = () => {
  return useQuery({
    queryKey: ["rasn-naskah-users-with-preferences"],
    queryFn: () => getUsersWithPreferences(),
  });
};
