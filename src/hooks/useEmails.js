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
} from "@/services/rasn-mail.services";
import { useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

export const useEmailStats = () => {
  return useQuery(["email-stats"], () => getEmailStats());
};

export const useSendEmail = () => {
  return useMutation({
    mutationFn: (email) => sendEmail(email),
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
