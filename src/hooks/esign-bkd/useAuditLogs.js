import { useQuery } from "@tanstack/react-query";
import {
  getDocumentLogs,
  getMyActivityLogs,
} from "@/services/esign-bkd.services";

// Query Keys
export const AUDIT_LOG_KEYS = {
  all: ["esign-bkd", "audit-logs"],
  documentLogs: (documentId, params) => [
    ...AUDIT_LOG_KEYS.all,
    "document",
    documentId,
    params,
  ],
  myActivity: (params) => [...AUDIT_LOG_KEYS.all, "my-activity", params],
};

// Get Document Audit Logs
export const useDocumentLogs = (documentId, params = {}) => {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.documentLogs(documentId, params),
    queryFn: () => getDocumentLogs(documentId, params),
    enabled: !!documentId,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Get My Activity Logs
export const useMyActivityLogs = (params = {}) => {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.myActivity(params),
    queryFn: () => getMyActivityLogs(params),
    keepPreviousData: true,
  });
};
