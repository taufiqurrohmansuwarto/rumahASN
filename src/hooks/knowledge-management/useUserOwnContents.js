import { getUserOwnContents } from "@/services/knowledge-management.services";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const useUserOwnContents = (query = {}) => {
  return useQuery({
    queryKey: ["user-own-contents", query],
    queryFn: () => getUserOwnContents(query),
    staleTime: 30000, // 30 seconds
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useUserOwnContentsInfinite = (query = {}) => {
  return useInfiniteQuery({
    queryKey: ["user-own-contents-infinite", query],
    queryFn: ({ pageParam = 1 }) =>
      getUserOwnContents({
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