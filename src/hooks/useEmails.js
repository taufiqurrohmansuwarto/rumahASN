import {
  deleteDraft,
  getDraft,
  getEmailStats,
  saveDraft,
  sendEmail,
  updateDraft,
} from "@/services/rasn-mail.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounceEffect } from "ahooks";
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

  useDebounceEffect(
    async () => {
      if (draftData?.subject || draftData?.content) {
        try {
          await saveDraft.mutateAsync(draftData);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    },
    [draftData],
    { wait: delay }
  );

  return { lastSaved, isAutoSaving: saveDraft.isLoading };
};
