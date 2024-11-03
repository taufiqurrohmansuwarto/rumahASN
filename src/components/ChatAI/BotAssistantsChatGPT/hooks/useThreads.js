import { useQuery } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";

export const useThreads = (assistantId) => {
  const {
    data: threads,
    isLoading,
    error,
  } = useQuery(
    ["threads", assistantId],
    () => AssistantAIServices.getThreads(assistantId),
    {
      enabled: !!assistantId,
      select: (data) =>
        data?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    }
  );

  return {
    threads,
    isLoading,
    error,
  };
};
