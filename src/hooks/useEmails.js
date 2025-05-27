import {
  deleteDraft,
  getDraft,
  getEmailStats,
  saveDraft,
  sendEmail,
  searchUsers,
  updateDraft,
  getInboxEmails,
  getSentEmails,
  getEmailById,
  markAsRead,
  toggleStar,
  moveToFolder,
  bulkDelete,
  deleteEmail,
  searchEmails,
  markAsUnread,
  // labels
  getUserLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  getEmailLabels,
  // assign label to email
  assignLabelToEmail,
  removeLabelFromEmail,
} from "@/services/rasn-mail.services";
import { useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

export const useEmailStats = () => {
  return useQuery(["email-stats"], () => getEmailStats());
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => sendEmail(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailStats"] });
    },
  });
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => saveDraft(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts", "email"] });
      queryClient.invalidateQueries({ queryKey: ["emailStats"] });
    },
  });
};

export const useUpdateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => updateDraft(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts", "email"] });
      queryClient.invalidateQueries({ queryKey: ["emailStats"] });
    },
  });
};

export const useDeleteDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => deleteDraft(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts", "email"] });
      queryClient.invalidateQueries({ queryKey: ["emailStats"] });
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
      queryClient.invalidateQueries({ queryKey: ["drafts", "email"] });
      queryClient.invalidateQueries({ queryKey: ["emailStats"] });
      message.success("Draft sent successfully");
    },
  });
};

export const useAutoSaveDraft = (draftData, delay = 5000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const saveDraft = useSaveDraft();

  // Custom debounce implementation
  const debounceRef = useRef(null);

  const performAutoSave = useCallback(
    async (data) => {
      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout
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

  // Cleanup timeout on unmount
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
    queryKey: ["inbox-emails", params],
    queryFn: () => getInboxEmails(params),
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });
};

export const useSentEmails = (params) => {
  return useQuery({
    queryKey: ["sent-emails", params],
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
      queryClient.invalidateQueries(["inbox-emails"]);
      queryClient.invalidateQueries(["email-stats"]);
      queryClient.invalidateQueries(["email-detail"]);
    },
  });
};

export const useMarkAsUnread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsUnread,
    onSuccess: () => {
      queryClient.invalidateQueries(["inbox-emails"]);
      queryClient.invalidateQueries(["email-stats"]);
    },
  });
};

export const useToggleStar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleStar,
    onSuccess: () => {
      queryClient.invalidateQueries(["inbox-emails"]);
      queryClient.invalidateQueries(["sent-emails"]);
      queryClient.invalidateQueries(["email-detail"]);
    },
  });
};

export const useMoveToFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, folder }) => moveToFolder(emailId, folder),
    onSuccess: () => {
      queryClient.invalidateQueries(["inbox-emails"]);
      queryClient.invalidateQueries(["sent-emails"]);
      queryClient.invalidateQueries(["email-detail"]);
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDelete,
    onSuccess: (data) => {
      message.success(`${data.data.deletedCount} email berhasil dihapus`);
      queryClient.invalidateQueries(["inbox-emails"]);
      queryClient.invalidateQueries(["sent-emails"]);
      queryClient.invalidateQueries(["email-stats"]);
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
      message.success("Email berhasil dihapus");
      queryClient.invalidateQueries(["inbox-emails"]);
      queryClient.invalidateQueries(["sent-emails"]);
      queryClient.invalidateQueries(["email-stats"]);
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Assign label to email
export const useAssignLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emailId, labelId }) => assignLabelToEmail(emailId, labelId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["email-labels", variables.emailId]);
      queryClient.invalidateQueries(["inbox-emails"]);
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
      queryClient.invalidateQueries(["inbox-emails"]);
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
