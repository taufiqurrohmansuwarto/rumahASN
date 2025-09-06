import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  submitMyContentForReview,
  editMyContent,
  deleteMyContent,
  getUserOwnContents,
  getUserOwnContent,
} from "@/services/knowledge-management.services";
import { useCallback, useState } from "react";

// ===== USER CONTENT QUERY HOOKS =====

/**
 * Get user's own contents with filters and pagination
 */
export const useUserOwnContents = (filters = {}) => {
  return useQuery({
    queryKey: ["user-own-contents", filters],
    queryFn: () => getUserOwnContents(filters),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

/**
 * Get single user content by ID
 */
export const useUserOwnContent = (contentId) => {
  return useQuery({
    queryKey: ["user-own-content", contentId],
    queryFn: () => getUserOwnContent(contentId),
    enabled: !!contentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===== USER CONTENT MUTATION HOOKS =====

/**
 * Submit content for review mutation
 */
export const useSubmitContentForReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMyContentForReview,
    onSuccess: (data, contentId) => {
      message.success("Konten berhasil disubmit untuk direview");
      
      // Invalidate related queries
      queryClient.invalidateQueries(["user-own-contents"]);
      queryClient.invalidateQueries(["user-own-content", contentId]);
      queryClient.invalidateQueries(["pending-revisions"]);
      
      return data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Gagal submit konten untuk review";
      message.error(errorMessage);
    },
  });
};

/**
 * Edit user content mutation
 */
export const useEditMyContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editMyContent,
    onSuccess: (data, variables) => {
      message.success("Konten berhasil diupdate");
      
      // Invalidate related queries
      queryClient.invalidateQueries(["user-own-contents"]);
      queryClient.invalidateQueries(["user-own-content", variables.id]);
      
      return data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Gagal mengupdate konten";
      message.error(errorMessage);
    },
  });
};

/**
 * Delete user content mutation
 */
export const useDeleteMyContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyContent,
    onSuccess: (data, contentId) => {
      message.success("Konten berhasil dihapus");
      
      // Invalidate related queries
      queryClient.invalidateQueries(["user-own-contents"]);
      queryClient.invalidateQueries(["user-own-content", contentId]);
      
      return data;
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Gagal menghapus konten";
      message.error(errorMessage);
    },
  });
};

// ===== COMPOSITE HOOKS =====

/**
 * Combined hook for user content management
 * Useful for content detail pages or forms
 */
export const useUserContentManagement = (contentId = null) => {
  const submitForReviewMutation = useSubmitContentForReview();
  const editContentMutation = useEditMyContent();
  const deleteContentMutation = useDeleteMyContent();
  
  const contentQuery = useUserOwnContent(contentId);

  // Submit content for review
  const handleSubmitForReview = useCallback(async () => {
    if (!contentId) return null;
    return await submitForReviewMutation.mutateAsync(contentId);
  }, [contentId, submitForReviewMutation]);

  // Edit content
  const handleEditContent = useCallback(async (data) => {
    if (!contentId) return null;
    return await editContentMutation.mutateAsync({ id: contentId, data });
  }, [contentId, editContentMutation]);

  // Delete content
  const handleDeleteContent = useCallback(async () => {
    if (!contentId) return null;
    return await deleteContentMutation.mutateAsync(contentId);
  }, [contentId, deleteContentMutation]);

  return {
    // Data
    content: contentQuery.data,
    
    // Loading states
    isLoadingContent: contentQuery.isLoading,
    isSubmittingForReview: submitForReviewMutation.isLoading,
    isEditingContent: editContentMutation.isLoading,
    isDeletingContent: deleteContentMutation.isLoading,
    
    // Actions
    handleSubmitForReview,
    handleEditContent,
    handleDeleteContent,
    
    // Refetch
    refetchContent: contentQuery.refetch,
    
    // Individual mutations for direct access
    submitForReviewMutation,
    editContentMutation,
    deleteContentMutation,
  };
};

/**
 * Hook for content list management
 * Useful for content listing pages with actions
 */
export const useUserContentList = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const contentsQuery = useUserOwnContents(filters);
  
  const submitForReviewMutation = useSubmitContentForReview();
  const deleteContentMutation = useDeleteMyContent();

  // Submit multiple contents for review
  const handleBulkSubmitForReview = useCallback(async (contentIds) => {
    const results = await Promise.allSettled(
      contentIds.map(id => submitForReviewMutation.mutateAsync(id))
    );
    
    const successful = results.filter(result => result.status === "fulfilled").length;
    const failed = results.filter(result => result.status === "rejected").length;
    
    if (successful > 0) {
      message.success(`${successful} konten berhasil disubmit untuk review`);
    }
    if (failed > 0) {
      message.warning(`${failed} konten gagal disubmit`);
    }
    
    return results;
  }, [submitForReviewMutation]);

  // Delete multiple contents
  const handleBulkDelete = useCallback(async (contentIds) => {
    const results = await Promise.allSettled(
      contentIds.map(id => deleteContentMutation.mutateAsync(id))
    );
    
    const successful = results.filter(result => result.status === "fulfilled").length;
    const failed = results.filter(result => result.status === "rejected").length;
    
    if (successful > 0) {
      message.success(`${successful} konten berhasil dihapus`);
    }
    if (failed > 0) {
      message.warning(`${failed} konten gagal dihapus`);
    }
    
    return results;
  }, [deleteContentMutation]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    // Data
    contents: contentsQuery.data?.data || [],
    total: contentsQuery.data?.total || 0,
    statusCounts: contentsQuery.data?.statusCounts || {},
    typeCounts: contentsQuery.data?.typeCounts || {},
    stats: contentsQuery.data?.stats || {},
    
    // Filters
    filters,
    updateFilters,
    
    // Loading states
    isLoadingContents: contentsQuery.isLoading,
    isSubmittingForReview: submitForReviewMutation.isLoading,
    isDeletingContent: deleteContentMutation.isLoading,
    
    // Actions
    handleBulkSubmitForReview,
    handleBulkDelete,
    
    // Refetch
    refetchContents: contentsQuery.refetch,
    
    // Individual mutations
    submitForReviewMutation,
    deleteContentMutation,
  };
};