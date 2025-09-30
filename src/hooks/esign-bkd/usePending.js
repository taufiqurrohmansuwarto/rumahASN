import { useQuery } from "@tanstack/react-query";
import { getPendingRequests } from "@/services/esign-bkd.services";

const PENDING_KEYS = {
  all: ["esign-pending"],
  list: (params) => [...PENDING_KEYS.all, "list", params],
};

/**
 * Hook to get pending signature requests that require user action
 * @param {Object} params - Query parameters (page, limit, search)
 * @param {Object} options - React Query options
 */
export const usePendingRequests = (params = {}, options = {}) => {
  return useQuery({
    queryKey: PENDING_KEYS.list(params),
    queryFn: () => getPendingRequests(params),
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for pending items
    ...options,
  });
};