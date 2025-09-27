import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSignatureRequests,
  createSignatureRequest,
  getSignatureRequestById,
  updateSignatureRequest,
  cancelSignatureRequest,
  getWorkflowStatus,
  completeSignatureRequest,
  getSignatureRequestStats,
} from "@/services/esign-bkd.services";

// Query Keys
export const SIGNATURE_REQUEST_KEYS = {
  all: ["esign-bkd", "signature-requests"],
  lists: () => [...SIGNATURE_REQUEST_KEYS.all, "list"],
  list: (params) => [...SIGNATURE_REQUEST_KEYS.lists(), params],
  details: () => [...SIGNATURE_REQUEST_KEYS.all, "detail"],
  detail: (id) => [...SIGNATURE_REQUEST_KEYS.details(), id],
  workflow: (id) => [...SIGNATURE_REQUEST_KEYS.all, "workflow", id],
  stats: () => [...SIGNATURE_REQUEST_KEYS.all, "stats"],
};

// Get Signature Requests
export const useSignatureRequests = (params = {}) => {
  return useQuery({
    queryKey: SIGNATURE_REQUEST_KEYS.list(params),
    queryFn: () => getSignatureRequests(params),
  });
};

// Get Signature Request by ID
export const useSignatureRequest = (id) => {
  return useQuery({
    queryKey: SIGNATURE_REQUEST_KEYS.detail(id),
    queryFn: () => getSignatureRequestById(id),
    enabled: !!id,
  });
};

// Get Workflow Status
export const useWorkflowStatus = (id) => {
  return useQuery({
    queryKey: SIGNATURE_REQUEST_KEYS.workflow(id),
    queryFn: () => getWorkflowStatus(id),
    enabled: !!id,
  });
};

// Get Signature Request Stats
export const useSignatureRequestStats = () => {
  return useQuery({
    queryKey: SIGNATURE_REQUEST_KEYS.stats(),
    queryFn: () => getSignatureRequestStats(),
  });
};

// Create Signature Request
export const useCreateSignatureRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createSignatureRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.stats() });
    },
  });
};

// Update Signature Request
export const useUpdateSignatureRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSignatureRequest(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SIGNATURE_REQUEST_KEYS.detail(variables.id)
      });
      queryClient.invalidateQueries({
        queryKey: SIGNATURE_REQUEST_KEYS.workflow(variables.id)
      });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.stats() });
    },
  });
};

// Cancel Signature Request
export const useCancelSignatureRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => cancelSignatureRequest(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.workflow(id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.stats() });
    },
  });
};

// Complete Signature Request
export const useCompleteSignatureRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => completeSignatureRequest(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.workflow(id) });
      queryClient.invalidateQueries({ queryKey: SIGNATURE_REQUEST_KEYS.stats() });
    },
  });
};