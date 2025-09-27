import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  previewDocument,
  createDocumentFormData,
  handleDownloadResponse,
  handlePreviewResponse,
} from "@/services/esign-bkd.services";

// Query Keys
export const DOCUMENT_KEYS = {
  all: ["esign-bkd", "documents"],
  lists: () => [...DOCUMENT_KEYS.all, "list"],
  list: (params) => [...DOCUMENT_KEYS.lists(), params],
  details: () => [...DOCUMENT_KEYS.all, "detail"],
  detail: (id) => [...DOCUMENT_KEYS.details(), id],
};

// Get Documents
export const useDocuments = (params = {}) => {
  return useQuery({
    queryKey: DOCUMENT_KEYS.list(params),
    queryFn: () => getDocuments(params),
  });
};

// Get Document by ID
export const useDocument = (id) => {
  return useQuery({
    queryKey: DOCUMENT_KEYS.detail(id),
    queryFn: () => getDocumentById(id),
    enabled: !!id,
  });
};

// Create Document
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, file }) => {
      const formData = createDocumentFormData(data, file);
      return createDocument(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.lists() });
    },
  });
};

// Update Document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateDocument(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: DOCUMENT_KEYS.detail(variables.id)
      });
    },
  });
};

// Delete Document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.lists() });
      queryClient.removeQueries({ queryKey: DOCUMENT_KEYS.detail(id) });
    },
  });
};

// Download Document
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: ({ id, filename }) => {
      return downloadDocument(id).then((data) => {
        handleDownloadResponse(data, filename);
        return data;
      });
    },
  });
};

// Preview Document
export const usePreviewDocument = () => {
  return useMutation({
    mutationFn: (id) => {
      return previewDocument(id).then((blob) => {
        return handlePreviewResponse(blob);
      });
    },
  });
};