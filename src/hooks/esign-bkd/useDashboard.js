import { useQuery } from "@tanstack/react-query";
import {
  getPendingDocuments,
  getMarkedForTteDocuments,
  getRejectedDocuments,
  getCompletedDocuments,
  getMarkedCount,
} from "@/services/esign-bkd.services";

// Query Keys
export const DASHBOARD_KEYS = {
  all: ["esign-bkd", "dashboard"],
  pending: (params) => [...DASHBOARD_KEYS.all, "pending", params],
  markedForTte: (params) => [...DASHBOARD_KEYS.all, "marked-for-tte", params],
  rejected: (params) => [...DASHBOARD_KEYS.all, "rejected", params],
  completed: (params) => [...DASHBOARD_KEYS.all, "completed", params],
  markedCount: () => [...DASHBOARD_KEYS.all, "marked-count"],
};

// Get Pending Documents
export const usePendingDocuments = (params = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.pending(params),
    queryFn: () => getPendingDocuments(params),
  });
};

// Get Marked for TTE Documents
export const useMarkedForTteDocuments = (params = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.markedForTte(params),
    queryFn: () => getMarkedForTteDocuments(params),
  });
};

// Get Rejected Documents
export const useRejectedDocuments = (params = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.rejected(params),
    queryFn: () => getRejectedDocuments(params),
  });
};

// Get Completed Documents
export const useCompletedDocuments = (params = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.completed(params),
    queryFn: () => getCompletedDocuments(params),
  });
};

// Get Marked Count
export const useMarkedCount = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.markedCount(),
    queryFn: () => getMarkedCount(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};