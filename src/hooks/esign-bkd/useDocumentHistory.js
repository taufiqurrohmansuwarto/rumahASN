import { useQuery } from "@tanstack/react-query";
import { getDocumentHistory } from "@/services/esign-bkd.services";

// Query Keys
export const DOCUMENT_HISTORY_KEYS = {
  all: ["esign-bkd", "document-history"],
  detail: (documentId) => [...DOCUMENT_HISTORY_KEYS.all, documentId],
};

// Get Document History
export const useDocumentHistory = (documentId) => {
  return useQuery({
    queryKey: DOCUMENT_HISTORY_KEYS.detail(documentId),
    queryFn: () => getDocumentHistory(documentId),
    enabled: !!documentId,
  });
};