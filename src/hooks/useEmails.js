import {
  deleteDraft,
  getDraft,
  getEmailStats,
  saveDraft,
  searchUsers,
  sendEmail,
  updateDraft,
} from "@/services/rasn-mail.services";
import { useDebouncedCallback } from "@mantine/hooks";
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

export const useGetDraft = () => {
  return useQuery({
    queryKey: ["drafts", "email"],
    queryFn: () => getDraft(),
    enabled: !!id,
  });
};

export const useSendDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => sendDraft(email),
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

  const performAutoSave = useDebouncedCallback(async (data) => {
    try {
      await saveDraft.mutateAsync(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, delay);

  useEffect(() => {
    if (draftData?.subject || draftData?.content) {
      performAutoSave(draftData);
    }
  }, [draftData, performAutoSave]);

  return { lastSaved, isAutoSaving: saveDraft.isLoading };
};

export const useSearchUsers = () => {
  return useQuery({
    queryKey: ["search-users", q],
    queryFn: () => searchUsers(q),
  });
};
