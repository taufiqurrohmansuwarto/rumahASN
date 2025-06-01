import {
  // archive emails
  archiveEmail,
  // assign label to email
  assignLabelToEmail,
  bulkDelete,
  createLabel,
  deleteAttachment,
  deleteDraft,
  deleteEmail,
  deleteLabel,
  deleteTrash,
  getArchiveEmails,
  getDraft,
  getEmailById,
  getEmailLabels,
  getEmailStats,
  // get email with thread
  getEmailWithThread,
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
  // reply to email
  replyToEmail,
  saveDraft,
  searchEmails,
  searchUsers,
  sendEmail,
  toggleStar,
  updateDraft,
  updateLabel,
  updatePriority,
} from "@/services/rasn-mail.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message, notification } from "antd";
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
      notification.success("Draft sent successfully");
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
      notification.error("Gagal menghapus email");
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
      notification.error("Gagal menghapus email");
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
      notification.success(data.message || "Label berhasil dibuat");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal membuat label";
      notification.error(errorMessage);
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
      notification.success(data.message || "Label berhasil diperbarui");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui label";
      notification.error(errorMessage);
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
      notification.success(data.message || "Label berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus label";
      notification.error(errorMessage);
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
      notification.success(data.message || "Label berhasil ditambahkan");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menambahkan label";
      notification.error(errorMessage);
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
      notification.success(data.message || "Label berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus label";
      notification.error(errorMessage);
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
      notification.error("Gagal mengarsipkan email");
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
      notification.error("Gagal menandai sebagai spam");
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
      notification.error("Gagal menghapus dari spam");
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

// Delete attachment hook - digunakan di AttachmentUploader
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-uploads"]);
      queryClient.invalidateQueries(["attachment"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus file";
      message.error(errorMessage);
    },
  });
};
