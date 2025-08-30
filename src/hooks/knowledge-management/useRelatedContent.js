import { useQuery } from "@tanstack/react-query";
import { getRelatedContents } from "@/services/knowledge-management.services";

export const useRelatedContent = (contentId, options = {}) => {
  return useQuery({
    queryKey: ["related-content", contentId],
    queryFn: () => getRelatedContents(contentId),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - related content doesn't change frequently
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};