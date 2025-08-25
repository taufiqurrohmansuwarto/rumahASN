import { getKnowledgeDashboardOverview, getKnowledgeCategoryAnalytics } from "@/services/knowledge-management.services";
import { useQuery } from "@tanstack/react-query";

export const useKnowledgeDashboardOverview = () => {
  return useQuery({
    queryKey: ["knowledge-dashboard-overview"],
    queryFn: getKnowledgeDashboardOverview,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
  });
};

export const useKnowledgeCategoryAnalytics = () => {
  return useQuery({
    queryKey: ["knowledge-category-analytics"],
    queryFn: getKnowledgeCategoryAnalytics,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
  });
};