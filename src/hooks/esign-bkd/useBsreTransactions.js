import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBsreTransactions,
  createBsreTransaction,
  getBsreTransactionById,
  sendToBsreForSigning,
  retryBsreTransaction,
  checkBsreStatus,
  getBsreTransactionStats,
} from "@/services/esign-bkd.services";

// Query Keys
export const BSRE_TRANSACTION_KEYS = {
  all: ["esign-bkd", "bsre-transactions"],
  lists: () => [...BSRE_TRANSACTION_KEYS.all, "list"],
  list: (params) => [...BSRE_TRANSACTION_KEYS.lists(), params],
  details: () => [...BSRE_TRANSACTION_KEYS.all, "detail"],
  detail: (id) => [...BSRE_TRANSACTION_KEYS.details(), id],
  status: (params) => [...BSRE_TRANSACTION_KEYS.all, "status", params],
  stats: (params) => [...BSRE_TRANSACTION_KEYS.all, "stats", params],
};

// Get BSrE Transactions
export const useBsreTransactions = (params = {}) => {
  return useQuery({
    queryKey: BSRE_TRANSACTION_KEYS.list(params),
    queryFn: () => getBsreTransactions(params),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// Get BSrE Transaction by ID
export const useBsreTransaction = (id) => {
  return useQuery({
    queryKey: BSRE_TRANSACTION_KEYS.detail(id),
    queryFn: () => getBsreTransactionById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// Check BSrE Status
export const useBsreStatus = (params = {}) => {
  return useQuery({
    queryKey: BSRE_TRANSACTION_KEYS.status(params),
    queryFn: () => checkBsreStatus(params),
    enabled: !!Object.keys(params).length,
    refetchInterval: 10000, // Check status every 10 seconds
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// Get BSrE Transaction Stats
export const useBsreTransactionStats = (params = {}) => {
  return useQuery({
    queryKey: BSRE_TRANSACTION_KEYS.stats(params),
    queryFn: () => getBsreTransactionStats(params),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// Create BSrE Transaction
export const useCreateBsreTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createBsreTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.stats(),
      });
    },
  });
};

// Send to BSrE for Signing
export const useSendToBsreForSigning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => sendToBsreForSigning(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.stats(),
      });
    },
  });
};

// Retry BSrE Transaction
export const useRetryBsreTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => retryBsreTransaction(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: BSRE_TRANSACTION_KEYS.stats(),
      });
    },
  });
};
