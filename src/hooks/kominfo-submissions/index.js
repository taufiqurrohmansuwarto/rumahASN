// Email Submissions - User & Admin
export {
  useEmailSubmissions,
  useCheckEmailJatimprov,
  useCreateEmailSubmission,
  useEmailSubmissionsAdmin,
  useUpdateEmailSubmissionAdmin,
  useEmailJatimprovPegawaiAdmin,
  useUploadEmailJatimprovExcel,
  useGetPhone,
  KOMINFO_SUBMISSION_KEYS,
} from "./useEmailSubmissions";

// TTE Submissions
export {
  useCheckTTE,
  useCreatePengajuanTTE,
  usePengajuanTTE,
  usePengajuanTTEById,
  useUploadFilePengajuanTTE,
  useSubmitPengajuanTTE,
  useGetDokumenTTE,
  useUploadFileFromUrl,
  usePengajuanTTEAdmin,
  useUpdatePengajuanTTEAdmin,
  TTE_SUBMISSION_KEYS,
} from "./useTTESubmissions";
