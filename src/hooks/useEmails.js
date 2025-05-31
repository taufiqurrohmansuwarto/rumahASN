import {
  // upload
  uploadSingleFile,
  uploadMultipleFiles,
  getAttachment,
  deleteAttachment,
  getUserUploads,
  getDownloadUrl,
  getUploadStats,
  cleanupUnusedFiles,
  validateFileSize,
  validateFileType,
  DEFAULT_ALLOWED_TYPES,

  // reply to email
  replyToEmail,
  // get email with thread
  getEmailWithThread,
  // archive emails
  archiveEmail,
  // assign label to email
  assignLabelToEmail,
  bulkDelete,
  createLabel,
  deleteDraft,
  deleteEmail,
  deleteLabel,
  getArchiveEmails,
  getDraft,
  getEmailById,
  getEmailLabels,
  getEmailStats,
  getInboxEmails,
  getLabelEmails,
  getSentEmails,
  getSpamEmails,
  // starred emails
  getStarredEmails,
  // labels
  getUserLabels,
  markAsNotSpam,
  markAsRead,
  // spam emails
  markAsSpam,
  markAsUnread,
  moveToFolder,
  removeLabelFromEmail,
  saveDraft,
  searchEmails,
  searchUsers,
  sendEmail,
  toggleStar,
  updateDraft,
  updateLabel,
  deleteTrash,
  updatePriority,
} from "@/services/rasn-mail.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

export const useEmailStats = () => {
  return useQuery(["email-stats"], () => getEmailStats());
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => sendEmail(email),
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation untuk send email
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => saveDraft(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
};

export const useUpdateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => updateDraft(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
};

export const useDeleteDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => deleteDraft(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
};

export const useGetDraft = (id) => {
  return useQuery({
    queryKey: ["drafts", "email", id],
    queryFn: () => getDraft(id),
    enabled: !!id,
  });
};

export const useSendDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => sendDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      message.success("Draft sent successfully");
    },
  });
};

export const useAutoSaveDraft = (draftData, delay = 5000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const saveDraft = useSaveDraft();

  const debounceRef = useRef(null);

  const performAutoSave = useCallback(
    async (data) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          await saveDraft.mutateAsync(data);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, delay);
    },
    [saveDraft, delay]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (draftData?.subject || draftData?.content) {
      performAutoSave(draftData);
    }
  }, [draftData, performAutoSave]);

  return { lastSaved, isAutoSaving: saveDraft.isLoading };
};

export const useSearchUsers = (q) => {
  return useQuery({
    queryKey: ["search-users", q],
    queryFn: () => searchUsers(q),
    enabled: !!q && q.length >= 2,
  });
};

// New hooks for inbox functionality
export const useInboxEmails = (params) => {
  return useQuery({
    queryKey: ["emails", "inbox", params],
    queryFn: () => getInboxEmails(params),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

export const useSentEmails = (params) => {
  return useQuery({
    queryKey: ["emails", "sent", params],
    queryFn: () => getSentEmails(params),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

export const useEmailById = (emailId) => {
  return useQuery({
    queryKey: ["email-detail", emailId],
    queryFn: () => getEmailById(emailId),
    enabled: !!emailId,
    refetchOnWindowFocus: false,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
  });
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, priority }) => updatePriority(emailId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
    },
  });
};

export const useMarkAsUnread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsUnread,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
  });
};

export const useToggleStar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleStar,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
  });
};

export const useMoveToFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, folder }) => moveToFolder(emailId, folder),
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation untuk semua folder
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDelete,
    onSuccess: (data) => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
    onError: () => {
      message.error("Gagal menghapus email");
    },
  });
};

export const useDeleteEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmail,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
    onError: () => {
      message.error("Gagal menghapus email");
    },
  });
};

export const useSearchEmails = (params) => {
  return useQuery({
    queryKey: ["search-emails", params],
    queryFn: () => searchEmails(params),
    enabled: !!params.q && params.q.length >= 2,
    keepPreviousData: true,
  });
};

// Get user labels
export const useUserLabels = () => {
  return useQuery({
    queryKey: ["user-labels"],
    queryFn: getUserLabels,
    staleTime: 5 * 60 * 1000,
  });
};

// Create label
export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLabel,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-labels"]);
      message.success(data.message || "Label berhasil dibuat");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal membuat label";
      message.error(errorMessage);
    },
  });
};

// Update label
export const useUpdateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labelId, ...labelData }) => updateLabel(labelId, labelData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-labels"]);
      message.success(data.message || "Label berhasil diperbarui");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui label";
      message.error(errorMessage);
    },
  });
};

// Delete label
export const useDeleteLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-labels"]);
      message.success(data.message || "Label berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus label";
      message.error(errorMessage);
    },
  });
};

// Get email labels
export const useEmailLabels = (emailId) => {
  return useQuery({
    queryKey: ["email-labels", emailId],
    queryFn: () => getEmailLabels(emailId),
    enabled: !!emailId,
    staleTime: 2 * 60 * 1000,
  });
};

// Assign label to email
export const useAssignLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emailId, labelId }) => assignLabelToEmail(emailId, labelId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["email-labels", variables.emailId]);
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries(["email-detail"]);
      message.success(data.message || "Label berhasil ditambahkan");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menambahkan label";
      message.error(errorMessage);
    },
  });
};

// Remove label from email
export const useRemoveLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emailId, labelId }) =>
      removeLabelFromEmail(emailId, labelId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["email-labels", variables.emailId]);
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries(["email-detail"]);
      message.success(data.message || "Label berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus label";
      message.error(errorMessage);
    },
  });
};

// ✅ TAMBAHKAN HOOKS INI
export const useStarredEmails = (params) => {
  return useQuery({
    queryKey: ["emails", "starred", params],
    queryFn: () => getStarredEmails(params),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

export const useArchiveEmails = (params) => {
  return useQuery({
    queryKey: ["emails", "archive", params],
    queryFn: () => getArchiveEmails(params),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

export const useSpamEmails = (params) => {
  return useQuery({
    queryKey: ["emails", "spam", params],
    queryFn: () => getSpamEmails(params),
    keepPreviousData: true,
    staleTime: 30000,
  });
};

// ✅ PERBAIKAN ACTION HOOKS
export const useArchiveEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveEmail,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
    onError: () => {
      message.error("Gagal mengarsipkan email");
    },
  });
};

export const useMarkAsSpam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsSpam,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
    onError: () => {
      message.error("Gagal menandai sebagai spam");
    },
  });
};

export const useMarkAsNotSpam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsNotSpam,
    onSuccess: () => {
      // ✅ PERBAIKAN: Comprehensive invalidation dan HAPUS message duplicate
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      // ❌ HAPUS: message.success() - biarkan component yang handle
    },
    onError: () => {
      message.error("Gagal menghapus dari spam");
    },
  });
};

export const useLabelEmails = (params) => {
  return useQuery({
    queryKey: ["emails", "label", params],
    queryFn: () => getLabelEmails(params),
    keepPreviousData: true,
    staleTime: 30000,
    enabled: !!params.labelId,
  });
};

export const useDeleteTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
    },
  });
};

// reply to email
export const useReplyToEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-stats"] });
      queryClient.invalidateQueries({ queryKey: ["email-detail"] });
      queryClient.invalidateQueries({ queryKey: ["email-with-thread"] });
    },
  });
};

// get email with thread
export const useGetEmailWithThread = (emailId) => {
  return useQuery({
    queryKey: ["email-with-thread", emailId],
    queryFn: () => getEmailWithThread(emailId),
    enabled: !!emailId,
    staleTime: 30000,
  });
};

// ==========================================
// UPLOAD HOOKS - Tambahkan di bagian bawah file useEmails.js
// ==========================================

// Upload single file hook
export const useUploadSingleFile = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file) => {
      // Validate file before upload
      if (!validateFileSize(file, 25)) {
        throw new Error("File terlalu besar. Maksimal 25MB");
      }

      if (!validateFileType(file, DEFAULT_ALLOWED_TYPES)) {
        throw new Error("Tipe file tidak didukung");
      }

      return uploadSingleFile(file, setUploadProgress);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-uploads"]);
      setUploadProgress(0);
      message.success(data.message || "File berhasil diunggah");
    },
    onError: (error) => {
      setUploadProgress(0);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengunggah file";
      message.error(errorMessage);
    },
    onMutate: () => {
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
};

// Upload multiple files hook
export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (files) => {
      // Validate files before upload
      const invalidFiles = [];

      files.forEach((file) => {
        if (!validateFileSize(file, 25)) {
          invalidFiles.push(`${file.name}: File terlalu besar`);
        }
        if (!validateFileType(file, DEFAULT_ALLOWED_TYPES)) {
          invalidFiles.push(`${file.name}: Tipe file tidak didukung`);
        }
      });

      if (invalidFiles.length > 0) {
        throw new Error(`File tidak valid:\n${invalidFiles.join("\n")}`);
      }

      return uploadMultipleFiles(files, setUploadProgress);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-uploads"]);
      setUploadProgress(0);
      message.success(data.message || "File berhasil diunggah");
    },
    onError: (error) => {
      setUploadProgress(0);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengunggah file";
      message.error(errorMessage);
    },
    onMutate: () => {
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
};

// Get attachment hook
export const useAttachment = (attachmentId) => {
  return useQuery({
    queryKey: ["attachment", attachmentId],
    queryFn: () => getAttachment(attachmentId),
    enabled: !!attachmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Delete attachment hook
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-uploads"]);
      queryClient.invalidateQueries(["attachment"]);
      message.success(data.message || "File berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus file";
      message.error(errorMessage);
    },
  });
};

// Get user uploads hook
export const useUserUploads = (params = {}) => {
  return useQuery({
    queryKey: ["user-uploads", params],
    queryFn: () => getUserUploads(params),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get download URL hook
export const useDownloadUrl = () => {
  return useMutation({
    mutationFn: getDownloadUrl,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal mendapatkan link download";
      message.error(errorMessage);
    },
  });
};

// Get upload statistics hook
export const useUploadStats = () => {
  return useQuery({
    queryKey: ["upload-stats"],
    queryFn: getUploadStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Cleanup unused files hook (admin)
export const useCleanupUnusedFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupUnusedFiles,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-uploads"]);
      queryClient.invalidateQueries(["upload-stats"]);
      message.success(data.message || "Cleanup berhasil");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal melakukan cleanup";
      message.error(errorMessage);
    },
  });
};

// File picker hook with validation
export const useFilePicker = (options = {}) => {
  const {
    multiple = false,
    accept = DEFAULT_ALLOWED_TYPES.join(","),
    maxSize = 25, // MB
    maxFiles = 10,
    onSelect,
    onError,
  } = options;

  const [selectedFiles, setSelectedFiles] = useState([]);

  const pickFiles = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = accept;

    input.onchange = (event) => {
      const files = Array.from(event.target.files || []);

      // Check file count limit
      if (multiple && files.length > maxFiles) {
        onError?.([`Maksimal ${maxFiles} file dapat dipilih`]);
        return;
      }

      // Validate files
      const validFiles = [];
      const errors = [];

      files.forEach((file) => {
        if (!validateFileSize(file, maxSize)) {
          errors.push(`${file.name}: File terlalu besar (max ${maxSize}MB)`);
        } else if (!validateFileType(file, DEFAULT_ALLOWED_TYPES)) {
          errors.push(`${file.name}: Tipe file tidak didukung`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        onError?.(errors);
        return;
      }

      setSelectedFiles(validFiles);
      onSelect?.(validFiles);
    };

    input.click();
  }, [multiple, accept, maxSize, maxFiles, onSelect, onError]);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    pickFiles,
    clearFiles,
    selectedFiles,
    hasFiles: selectedFiles.length > 0,
  };
};

// Antd Upload props helper hook
export const useAntdUploadProps = (options = {}) => {
  const {
    multiple = false,
    maxFiles = 10,
    maxSize = 25,
    onFilesChange,
    onError,
    disabled = false,
  } = options;

  const uploadSingle = useUploadSingleFile();
  const uploadMultiple = useUploadMultipleFiles();

  // Antd Upload props configuration
  const uploadProps = {
    name: "file",
    multiple,
    maxCount: multiple ? maxFiles : 1,
    accept: DEFAULT_ALLOWED_TYPES.join(","),
    showUploadList: false,
    disabled: disabled || uploadSingle.isLoading || uploadMultiple.isLoading,

    // Custom upload function
    customRequest: async ({
      file,
      onSuccess,
      onError: onUploadError,
      onProgress,
    }) => {
      try {
        // Validate file
        if (!validateFileSize(file, maxSize)) {
          throw new Error(
            `${file.name}: File terlalu besar (max ${maxSize}MB)`
          );
        }

        if (!validateFileType(file, DEFAULT_ALLOWED_TYPES)) {
          throw new Error(`${file.name}: Tipe file tidak didukung`);
        }

        // Progress handler yang menggabungkan internal progress dan Antd progress
        const progressHandler = (progress) => {
          // Update progress ke Antd Upload
          onProgress?.({ percent: progress });
        };

        // Upload file dengan progress handler
        const result = await uploadSingleFile(file, progressHandler);
        onSuccess(result.data, file);
        onFilesChange?.([result.data]);
      } catch (error) {
        const errorMessage = error.message || "Gagal mengunggah file";
        onUploadError(error);
        onError?.(errorMessage);
      }
    },

    // Multiple files handler
    onChange: async (info) => {
      const { fileList, file } = info;

      if (multiple && fileList.length > 1) {
        // Handle multiple files upload
        const filesToUpload = fileList
          .filter((f) => f.status !== "done" && f.status !== "error")
          .map((f) => f.originFileObj)
          .filter(Boolean);

        if (filesToUpload.length > 0) {
          try {
            // Progress handler untuk multiple files
            const progressHandler = (progress) => {
              // Update progress untuk semua file yang sedang diupload
              fileList.forEach((fileItem) => {
                if (fileItem.status === "uploading") {
                  fileItem.percent = progress;
                }
              });
            };

            const result = await uploadMultipleFiles(
              filesToUpload,
              progressHandler
            );
            onFilesChange?.(result.data.uploaded || []);
          } catch (error) {
            const errorMessage = error.message || "Gagal mengunggah file";
            onError?.(errorMessage);
          }
        }
      }
    },

    // Validation before upload
    beforeUpload: (file, fileList) => {
      // Check file count
      if (multiple && fileList.length > maxFiles) {
        onError?.(`Maksimal ${maxFiles} file dapat di-upload`);
        return false;
      }

      // Check file size
      if (!validateFileSize(file, maxSize)) {
        onError?.(`${file.name}: File terlalu besar (max ${maxSize}MB)`);
        return false;
      }

      // Check file type
      if (!validateFileType(file, DEFAULT_ALLOWED_TYPES)) {
        onError?.(`${file.name}: Tipe file tidak didukung`);
        return false;
      }

      return false; // Prevent default upload, use customRequest
    },
  };

  return {
    uploadProps,
    uploading: false, // Will be handled by Antd Upload internally
    uploadProgress: 0, // Will be handled by Antd Upload internally
  };
};
