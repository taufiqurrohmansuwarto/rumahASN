import { useQuery } from "@tanstack/react-query";
import {
  getTopContributors,
  getTopContents,
  getTopCategories,
  getTopTags,
} from "@/services/knowledge-management.services";

// Hook for top contributors
export const useTopContributors = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["knowledge-insights", "top-contributors", params],
    queryFn: () => getTopContributors(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for top contents
export const useTopContents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["knowledge-insights", "top-contents", params],
    queryFn: () => getTopContents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for top categories
export const useTopCategories = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["knowledge-insights", "top-categories", params],
    queryFn: () => getTopCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for top tags
export const useTopTags = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["knowledge-insights", "top-tags", params],
    queryFn: () => getTopTags(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Combined hook for all insights (useful for dashboard)
export const useKnowledgeInsights = (params = {}, options = {}) => {
  const contributors = useTopContributors(
    { ...params, limit: params.contributorsLimit || 10 },
    options
  );
  
  const contents = useTopContents(
    { ...params, limit: params.contentsLimit || 10 },
    options
  );
  
  const categories = useTopCategories(
    { ...params, limit: params.categoriesLimit || 10 },
    options
  );
  
  const tags = useTopTags(
    { ...params, limit: params.tagsLimit || 20 },
    options
  );

  return {
    contributors,
    contents,
    categories,
    tags,
    isLoading: contributors.isLoading || contents.isLoading || categories.isLoading || tags.isLoading,
    isError: contributors.isError || contents.isError || categories.isError || tags.isError,
    error: contributors.error || contents.error || categories.error || tags.error,
  };
};

// Hook with specific period configurations
export const useKnowledgeInsightsByPeriod = (period = "month", options = {}) => {
  const baseParams = { period };
  
  return {
    contributors: useTopContributors(baseParams, options),
    contents: useTopContents(baseParams, options),
    categories: useTopCategories(baseParams, options),
    tags: useTopTags(baseParams, options),
  };
};

// Hook for trending content (high engagement)
export const useTrendingContent = (period = "week", options = {}) => {
  return useTopContents(
    { 
      period, 
      sortBy: "engagement", 
      limit: 5 
    }, 
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for trending
      ...options
    }
  );
};

// Hook for active contributors (for leaderboard)
export const useActiveContributors = (period = "month", options = {}) => {
  return useTopContributors(
    { 
      period, 
      limit: 10 
    }, 
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...options
    }
  );
};