import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdminKnowledgeContents } from "@/services/knowledge-management.services";
import { useDebouncedValue } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

/**
 * Comprehensive admin hook for knowledge content management
 * Supports all filters like user system: search, category, tag, type, sort, status
 * 
 * @param {Object} filters - Filter parameters from parent component
 * @param {string} filters.searchQuery - Search term
 * @param {string} filters.selectedCategory - Category ID  
 * @param {Array} filters.selectedTag - Array of tags
 * @param {string} filters.selectedSort - Sort option (field:direction)
 * @param {string} filters.selectedType - Content type filter
 * @param {string} filters.selectedStatus - Content status filter
 */
export const useAdminContents = (filters = {}) => {
  useScrollRestoration();
  
  // Extract filters with defaults
  const {
    searchQuery = "",
    selectedCategory = null,
    selectedTag = null,
    selectedSort = "created_at:desc",
    selectedType = "all", 
    selectedStatus = "pending",
  } = filters;

  // Debounced search for better performance
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Build query parameters for API call
  const queryParams = {
    search: debouncedSearch,
    category_id: selectedCategory,
    tags: selectedTag && selectedTag.length > 0 ? selectedTag.join(",") : undefined,
    sort: selectedSort,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    type: selectedType === "all" ? undefined : selectedType,
  };

  // Infinite query with comprehensive filter support
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(
    // Query key includes all filters for proper caching
    [
      "fetch-knowledge-admin-contents", 
      debouncedSearch, 
      selectedCategory,
      selectedTag,
      selectedSort,
      selectedType,
      selectedStatus
    ],
    ({ pageParam = 1 }) =>
      getAdminKnowledgeContents({
        ...queryParams,
        page: pageParam,
        limit: 10,
      }),
    {
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = allPages.length;
        const totalPages = Math.ceil(lastPage.total / 10);
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    }
  );

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Flatten all pages data
  const allContents = data?.pages?.flatMap((page) => page.data) || [];
  
  // Get comprehensive counts from first page (consistent across all pages)
  const firstPage = data?.pages?.[0] || {};
  const statusCounts = firstPage.statusCounts || {};
  const typeCounts = firstPage.typeCounts || {};
  const categoryCounts = firstPage.categoryCounts || {};
  const stats = firstPage.stats || {};

  return {
    // Content data
    allContents,
    
    // Pagination
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    
    // Loading states
    isLoading,
    isError,
    
    // Statistics - matching user bookmark system format
    statusCounts,
    typeCounts,
    categoryCounts,
    stats,
  };
};
