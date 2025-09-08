import { getUserOwnContentsBookmarks } from "@/services/knowledge-management.services";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const useUserBookmarks = (query = {}) => {
  return useQuery({
    queryKey: ["user-bookmarks", query],
    queryFn: () => getUserOwnContentsBookmarks(query),
    staleTime: 30000, // 30 seconds
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useUserBookmarksInfinite = (query = {}) => {
  return useInfiniteQuery({
    queryKey: ["user-bookmarks-infinite", query],
    queryFn: ({ pageParam = 1 }) =>
      getUserOwnContentsBookmarks({
        ...query,
        page: pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.total / 10);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 30000,
    cacheTime: 300000,
  });
};