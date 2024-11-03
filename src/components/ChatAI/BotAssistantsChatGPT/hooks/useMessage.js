import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";

export const useMessages = ({ assistantId, threadId }) => {
  const queryClient = useQueryClient();

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery(
    ["messages", assistantId, threadId],
    () => AssistantAIServices.getThreadMessages({ assistantId, threadId }),
    {
      enabled: !!assistantId && !!threadId,
      refetchInterval: 3000,
      select: (data) =>
        data?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    }
  );

  const sendMessageMutation = useMutation(
    (message) =>
      AssistantAIServices.sendMessage({
        assistantId,
        threadId,
        message,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["messages", assistantId, threadId]);
      },
    }
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isLoading,
  };
};
