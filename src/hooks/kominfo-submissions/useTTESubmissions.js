import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkTTE,
  createPengajuanTTE,
  getPengajuanTTE,
  getPengajuanTTEById,
} from "@/services/kominfo-submissions.services";

// Query Keys
export const TTE_SUBMISSION_KEYS = {
  all: ["kominfo-submissions", "tte"],
  checkTTE: () => [...TTE_SUBMISSION_KEYS.all, "check"],
  pengajuanTTE: () => [...TTE_SUBMISSION_KEYS.all, "pengajuan"],
  pengajuanTTEList: () => [...TTE_SUBMISSION_KEYS.pengajuanTTE(), "list"],
  pengajuanTTEDetail: (id) => [...TTE_SUBMISSION_KEYS.pengajuanTTE(), id],
};

// Check TTE Status
export const useCheckTTE = () => {
  return useQuery({
    queryKey: TTE_SUBMISSION_KEYS.checkTTE(),
    queryFn: () => checkTTE(),
    staleTime: 60000, // 1 minute
  });
};

// Create Pengajuan TTE
export const useCreatePengajuanTTE = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createPengajuanTTE(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.all,
      });
    },
  });
};

// Get List Pengajuan TTE (User's submissions)
export const usePengajuanTTE = () => {
  return useQuery({
    queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEList(),
    queryFn: () => getPengajuanTTE(),
    staleTime: 30000, // 30 seconds
  });
};

// Get Pengajuan TTE by ID
export const usePengajuanTTEById = (id) => {
  return useQuery({
    queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEDetail(id),
    queryFn: () => getPengajuanTTEById(id),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  });
};
