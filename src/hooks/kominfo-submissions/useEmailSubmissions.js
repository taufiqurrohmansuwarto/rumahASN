import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmailSubmission,
  listEmailSubmission,
  checkEmailJatimprov,
  listEmailSubmissionAdmin,
  updateEmailSubmissionAdmin,
  listEmailJatimprovPegawaiAdmin,
  uploadEmailJatimprovExcel,
  getPhone,
} from "@/services/kominfo-submissions.services";

// Query Keys
export const KOMINFO_SUBMISSION_KEYS = {
  all: ["kominfo-submissions"],
  emailSubmissions: () => [...KOMINFO_SUBMISSION_KEYS.all, "email"],
  emailSubmissionList: () => [
    ...KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
    "list",
  ],
  checkEmailJatimprov: () => [
    ...KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
    "check-jatimprov",
  ],
  emailSubmissionListAdmin: (params) => [
    ...KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
    "admin-list",
    params,
  ],
  emailSubmissionDetail: (id) => [
    ...KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
    "detail",
    id,
  ],
  emailJatimprovPegawaiAdmin: (params) => [
    ...KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
    "jatimprov-mails-admin",
    params,
  ],
  getPhone: () => [...KOMINFO_SUBMISSION_KEYS.emailSubmissions(), "phone"],
};

// Get List Email Submissions
export const useEmailSubmissions = () => {
  return useQuery({
    queryKey: KOMINFO_SUBMISSION_KEYS.emailSubmissionList(),
    queryFn: () => listEmailSubmission(),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

// Check Submission Status
export const useCheckEmailJatimprov = () => {
  return useQuery({
    queryKey: KOMINFO_SUBMISSION_KEYS.checkEmailJatimprov(),
    queryFn: () => checkEmailJatimprov(),
    staleTime: 60000, // 1 minute
  });
};

// Create Email Submission
export const useCreateEmailSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createEmailSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
      });
    },
  });
};

// Admin Hooks
// Get List Email Submissions Admin
export const useEmailSubmissionsAdmin = (params = {}) => {
  const { search = "", page = 1, limit = 10, status = "DIAJUKAN" } = params;

  return useQuery({
    queryKey: KOMINFO_SUBMISSION_KEYS.emailSubmissionListAdmin({
      search,
      page,
      limit,
      status,
    }),
    queryFn: () => listEmailSubmissionAdmin({ search, page, limit, status }),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

// Update Email Submission Admin
export const useUpdateEmailSubmissionAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateEmailSubmissionAdmin({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KOMINFO_SUBMISSION_KEYS.emailSubmissions(),
      });
    },
  });
};

// Get List Email Jatimprov Pegawai Admin
export const useEmailJatimprovPegawaiAdmin = (params = {}) => {
  const { search = "", page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: KOMINFO_SUBMISSION_KEYS.emailJatimprovPegawaiAdmin({
      search,
      page,
      limit,
    }),
    queryFn: () => listEmailJatimprovPegawaiAdmin({ search, page, limit }),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

// Get Phone Numbers
export const useGetPhone = () => {
  return useQuery({
    queryKey: KOMINFO_SUBMISSION_KEYS.getPhone(),
    queryFn: () => getPhone(),
    staleTime: 60000, // 1 minute
  });
};

// Upload Email Jatimprov Excel
export const useUploadEmailJatimprovExcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadEmailJatimprovExcel(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KOMINFO_SUBMISSION_KEYS.emailJatimprovPegawaiAdmin(),
      });
    },
  });
};
