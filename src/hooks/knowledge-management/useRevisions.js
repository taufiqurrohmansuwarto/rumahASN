import {
  approveRevision,
  bulkApproveRevisions,
  bulkRejectRevisions,
  createRevision,
  getAdminContentRevisions,
  getMyRevisions,
  getPendingRevisions,
  getRevisionDetails,
  submitRevision,
  updateRevision,
  uploadRevisionMedia,
  uploadRevisionAttachments,
} from "@/services/knowledge-management.services";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useCallback, useState } from "react";

// ===== USER REVISION HOOKS =====

// Get user's revisions for specific content
export const useMyRevisions = (contentId) => {
  return useQuery({
    queryKey: ["my-revisions", contentId],
    queryFn: () => getMyRevisions(contentId),
    enabled: !!contentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create new revision mutation
export const useCreateRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRevision,
    onSuccess: (data, contentId) => {
      message.success("Revision berhasil dibuat");

      // Invalidate related queries
      queryClient.invalidateQueries(["my-revisions", contentId]);
      queryClient.invalidateQueries(["user-own-contents"]);

      return data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal membuat revision";
      message.error(errorMessage);
    },
  });
};

// Update revision mutation
export const useUpdateRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRevision,
    onSuccess: (data, variables) => {
      message.success("Revision berhasil diupdate");

      // Invalidate related queries
      queryClient.invalidateQueries(["my-revisions", variables.contentId]);
      queryClient.invalidateQueries(["revision-details", variables.versionId]);

      return data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal mengupdate revision";
      message.error(errorMessage);
    },
  });
};

// Submit revision for review mutation
export const useSubmitRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRevision,
    onSuccess: (data, variables) => {
      message.success("Revision berhasil disubmit untuk review");

      // Invalidate related queries
      queryClient.invalidateQueries(["my-revisions", variables.contentId]);
      queryClient.invalidateQueries([
        "revision-details",
        variables.versionId,
        variables.contentId,
      ]);
      queryClient.invalidateQueries(["pending-revisions"]);

      return data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal submit revision";
      message.error(errorMessage);
    },
  });
};

// Upload revision media mutation
export const useUploadRevisionMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadRevisionMedia,
    onSuccess: (data, variables) => {
      message.success("Media berhasil diupload");

      // Invalidate related queries
      queryClient.invalidateQueries(["my-revisions", variables.contentId]);
      queryClient.invalidateQueries([
        "revision-details",
        variables.versionId,
        variables.contentId,
      ]);

      return data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal upload media";
      message.error(errorMessage);
    },
  });
};

// Upload revision attachments mutation
export const useUploadRevisionAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadRevisionAttachments,
    onSuccess: (data, variables) => {
      message.success("Attachment berhasil diupload");

      // Invalidate related queries
      queryClient.invalidateQueries(["my-revisions", variables.contentId]);
      queryClient.invalidateQueries([
        "revision-details",
        variables.versionId,
        variables.contentId,
      ]);

      return data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal upload attachment";
      message.error(errorMessage);
    },
  });
};

// ===== ADMIN REVISION HOOKS =====

// Get admin revisions for specific content
export const useAdminContentRevisions = (contentId) => {
  return useQuery({
    queryKey: ["admin-content-revisions", contentId],
    queryFn: () => getAdminContentRevisions(contentId),
    enabled: !!contentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get pending revisions with search, pagination, and filters
export const usePendingRevisions = (initialStatus = "pending_revision") => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  const queryParams = {
    page: currentPage,
    limit: 10,
    status: initialStatus,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(categoryFilter && { category_id: categoryFilter }),
    ...(authorFilter && { author_id: authorFilter }),
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pending-revisions", queryParams],
    queryFn: () => getPendingRevisions(queryParams),
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  });

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("");
    setAuthorFilter("");
    setCurrentPage(1);
  }, []);

  return {
    // Data
    data: data?.data || [],
    total: data?.total || 0,
    statusCounts: data?.statusCounts || {},

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    authorFilter,
    setAuthorFilter,
    currentPage,

    // Actions
    handlePageChange,
    resetFilters,
    refetch,

    // States
    isLoading,
    isError,
  };
};

// Get revision details (supports both user and admin endpoints)
export const useRevisionDetails = (versionId, contentId = null) => {
  return useQuery({
    queryKey: ["revision-details", versionId, contentId],
    queryFn: () => getRevisionDetails(versionId, contentId),
    enabled: !!versionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Approve/reject revision mutation
export const useApproveRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRevision,
    onSuccess: (data, variables) => {
      const action = variables.action;
      const successMessage =
        action === "approve"
          ? "Revision berhasil disetujui"
          : "Revision berhasil ditolak";

      message.success(successMessage);

      // Invalidate related queries
      queryClient.invalidateQueries(["pending-revisions"]);
      queryClient.invalidateQueries(["revision-details", variables.versionId]);
      queryClient.invalidateQueries(["admin-contents"]);
      
      // Invalidate admin content revisions if contentId is available
      if (data.contentId) {
        queryClient.invalidateQueries(["admin-content-revisions", data.contentId]);
        queryClient.invalidateQueries(["admin-content-detail", data.contentId]);
      }

      // If approved, also invalidate user's own content queries
      if (action === "approve" && data.contentId) {
        queryClient.invalidateQueries(["user-own-contents"]);
      }

      return data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal memproses revision";
      message.error(errorMessage);
    },
  });
};

// Bulk approve revisions
export const useBulkApproveRevisions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkApproveRevisions,
    onSuccess: (results) => {
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (successful > 0) {
        message.success(`${successful} revision berhasil disetujui`);
      }
      if (failed > 0) {
        message.warning(`${failed} revision gagal disetujui`);
      }

      // Invalidate related queries
      queryClient.invalidateQueries(["pending-revisions"]);
      queryClient.invalidateQueries(["admin-contents"]);

      return results;
    },
    onError: (error) => {
      message.error("Gagal melakukan bulk approve");
    },
  });
};

// Bulk reject revisions
export const useBulkRejectRevisions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ versionIds, rejectionReason }) =>
      bulkRejectRevisions(versionIds, rejectionReason),
    onSuccess: (results) => {
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (successful > 0) {
        message.success(`${successful} revision berhasil ditolak`);
      }
      if (failed > 0) {
        message.warning(`${failed} revision gagal ditolak`);
      }

      // Invalidate related queries
      queryClient.invalidateQueries(["pending-revisions"]);

      return results;
    },
    onError: (error) => {
      message.error("Gagal melakukan bulk reject");
    },
  });
};

// ===== UTILITY HOOKS =====

// Combined hook for revision management (useful for revision forms)
export const useRevisionManagement = (contentId, versionId = null) => {
  const createRevisionMutation = useCreateRevision();
  const updateRevisionMutation = useUpdateRevision();
  const submitRevisionMutation = useSubmitRevision();
  const uploadMediaMutation = useUploadRevisionMedia();
  const uploadAttachmentsMutation = useUploadRevisionAttachments();

  const myRevisionsQuery = useMyRevisions(contentId);
  const revisionDetailsQuery = useRevisionDetails(versionId);

  // Create new revision
  const handleCreateRevision = useCallback(async () => {
    if (!contentId) return null;
    return await createRevisionMutation.mutateAsync(contentId);
  }, [contentId, createRevisionMutation]);

  // Update revision content
  const handleUpdateRevision = useCallback(
    async (data, changeNotes = "") => {
      if (!contentId || !versionId) return null;
      return await updateRevisionMutation.mutateAsync({
        contentId,
        versionId,
        data: { ...data, changeNotes },
      });
    },
    [contentId, versionId, updateRevisionMutation]
  );

  // Submit revision for review
  const handleSubmitRevision = useCallback(
    async (submitNotes = "") => {
      if (!contentId || !versionId) return null;
      return await submitRevisionMutation.mutateAsync({
        contentId,
        versionId,
        submitNotes,
      });
    },
    [contentId, versionId, submitRevisionMutation]
  );

  // Upload revision media
  const handleUploadMedia = useCallback(
    async (data) => {
      if (!contentId || !versionId) return null;
      return await uploadMediaMutation.mutateAsync({
        contentId,
        versionId,
        data,
      });
    },
    [contentId, versionId, uploadMediaMutation]
  );

  // Upload revision attachments
  const handleUploadAttachments = useCallback(
    async (data) => {
      if (!contentId || !versionId) return null;
      return await uploadAttachmentsMutation.mutateAsync({
        contentId,
        versionId,
        data,
      });
    },
    [contentId, versionId, uploadAttachmentsMutation]
  );

  return {
    // Queries
    myRevisions: myRevisionsQuery.data,
    revisionDetails: revisionDetailsQuery.data,

    // Loading states
    isCreating: createRevisionMutation.isLoading,
    isUpdating: updateRevisionMutation.isLoading,
    isSubmitting: submitRevisionMutation.isLoading,
    isUploadingMedia: uploadMediaMutation.isLoading,
    isUploadingAttachments: uploadAttachmentsMutation.isLoading,
    isLoadingRevisions: myRevisionsQuery.isLoading,
    isLoadingDetails: revisionDetailsQuery.isLoading,

    // Actions
    handleCreateRevision,
    handleUpdateRevision,
    handleSubmitRevision,
    handleUploadMedia,
    handleUploadAttachments,

    // Refetch functions
    refetchRevisions: myRevisionsQuery.refetch,
    refetchDetails: revisionDetailsQuery.refetch,
  };
};
