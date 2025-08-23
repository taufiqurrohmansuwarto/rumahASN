import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdminKnowledgeContents } from "@/services/knowledge-management.services";
import { useDebouncedValue } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export const useAdminContents = (status = "draft") => {
  useScrollRestoration();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(
    ["fetch-knowledge-admin-contents", debouncedSearch, status],
    ({ pageParam = 1 }) =>
      getAdminKnowledgeContents({
        page: pageParam,
        limit: 10,
        search: debouncedSearch,
        status: status,
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
  
  // Get status counts from first page (same across all pages)
  const statusCounts = data?.pages?.[0]?.statusCounts || {};

  return {
    searchQuery,
    setSearchQuery,
    allContents,
    statusCounts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  };
};
