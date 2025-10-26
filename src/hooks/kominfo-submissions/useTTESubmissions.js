import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkTTE,
  createPengajuanTTE,
  getPengajuanTTE,
  getPengajuanTTEById,
  uploadFilePengajuanTTE,
  submitPengajuanTTE,
  getDokumenTTE,
  uploadFileFromUrl,
  listPengajuanTTEAdmin,
  updatePengajuanTTEAdmin,
} from "@/services/kominfo-submissions.services";

// Query Keys
export const TTE_SUBMISSION_KEYS = {
  all: ["kominfo-submissions", "tte"],
  checkTTE: () => [...TTE_SUBMISSION_KEYS.all, "check"],
  pengajuanTTE: () => [...TTE_SUBMISSION_KEYS.all, "pengajuan"],
  pengajuanTTEList: () => [...TTE_SUBMISSION_KEYS.pengajuanTTE(), "list"],
  pengajuanTTEDetail: (id) => [...TTE_SUBMISSION_KEYS.pengajuanTTE(), id],
  pengajuanTTEAdmin: (params) => [
    ...TTE_SUBMISSION_KEYS.all,
    "admin",
    "list",
    params,
  ],
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

// Upload File Pengajuan TTE
export const useUploadFilePengajuanTTE = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => uploadFilePengajuanTTE(id, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEList(),
      });
    },
  });
};

// Submit Pengajuan TTE
export const useSubmitPengajuanTTE = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => submitPengajuanTTE(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEDetail(id),
      });
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEList(),
      });
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.checkTTE(),
      });
    },
  });
};

// Get Dokumen TTE (KTP & Riwayat Jabatan)
export const useGetDokumenTTE = () => {
  return useQuery({
    queryKey: [...TTE_SUBMISSION_KEYS.all, "dokumen"],
    queryFn: () => getDokumenTTE(),
    staleTime: 300000, // 5 minutes
  });
};

// Upload File from URL
export const useUploadFileFromUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => uploadFileFromUrl(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEList(),
      });
    },
  });
};

// Admin - Get List Pengajuan TTE
export const usePengajuanTTEAdmin = (params = {}) => {
  const { page = 1, limit = 10, search = "", status = "DIAJUKAN" } = params;

  return useQuery({
    queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEAdmin({
      page,
      limit,
      search,
      status,
    }),
    queryFn: () =>
      listPengajuanTTEAdmin({
        page,
        limit,
        search,
        status,
      }),
    staleTime: 30000, // 30 seconds
    keepPreviousData: true, // Keep previous data while fetching new data
  });
};

// Admin - Update Pengajuan TTE
export const useUpdatePengajuanTTEAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updatePengajuanTTEAdmin(id, data),
    onSuccess: (data, variables) => {
      // Invalidate all admin lists
      queryClient.invalidateQueries({
        queryKey: [...TTE_SUBMISSION_KEYS.all, "admin"],
      });
      // Invalidate specific detail if needed
      queryClient.invalidateQueries({
        queryKey: TTE_SUBMISSION_KEYS.pengajuanTTEDetail(variables.id),
      });
    },
  });
};
