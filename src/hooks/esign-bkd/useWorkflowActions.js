import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewDocument,
  markForTte,
  signDocument,
  rejectDocument,
  updateSignaturePosition,
} from "@/services/esign-bkd.services";
import { DOCUMENT_KEYS } from "./useDocuments";
import { SIGNATURE_REQUEST_KEYS } from "./useSignatureRequests";
import { DASHBOARD_KEYS } from "./useDashboard";

// Review Document
export const useReviewDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => reviewDocument(id, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};

// Mark for TTE
export const useMarkForTte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => markForTte(id, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};

// Sign Document
export const useSignDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => signDocument(id, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};

// Reject Document
export const useRejectDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => rejectDocument(id, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
};

// Update Signature Position
export const useUpdateSignaturePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSignaturePosition(id, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.detail(variables.id) });
    },
  });
};