import { AssistantAIServices } from "@/services/assistant-ai.services";
import useChatStore from "@/store/useChat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Sender from "../Sender";

function AntdChatSender({ style }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const senderRef = useRef(null);

  const { setSendSuccess, setLastId } = useChatStore();

  const { mutate: send, isLoading } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onMutate: async ({ message }) => {
        if (threadId && assistantId) {
          await queryClient.cancelQueries([
            "chat-messages",
            threadId,
            assistantId,
          ]);
          const previousMessages = queryClient.getQueryData([
            "chat-messages",
            threadId,
            assistantId,
          ]);
          const lastId = previousMessages[previousMessages.length - 1].id;
          queryClient.setQueryData(
            ["chat-messages", threadId, assistantId],
            (old) => [
              ...old,
              {
                id: Date.now(),
                content: message,
                role: "user",
                loading: false,
              },
              {
                id: Date.now(),
                content: "Typing...",
                role: "ai",
                loading: true,
              },
            ]
          );
          setLastId(lastId);
          return { previousMessages };
        }
      },
      onError: (err, newMessage, context) => {
        queryClient.setQueryData(
          ["chat-messages", threadId, assistantId],
          context.previousMessages
        );
      },
      onSettled: () => {
        if (threadId && assistantId) {
          queryClient.invalidateQueries([
            "chat-messages",
            threadId,
            assistantId,
          ]);
          setSendSuccess(false);
        }
      },
      onSuccess: (data) => {
        if (threadId && assistantId) {
          setSendSuccess(true);
          setLastId(data.id);
        } else {
          queryClient.invalidateQueries(["threads"]);
          router.push(
            `/chat-ai?assistantId=${assistantId}&threadId=${data?.threadId}`
          );
        }
      },
    }
  );

  const { threadId } = router.query;
  const { assistantId } = router.query;

  const handleChange = (e) => {
    setMessage(e);
  };

  const handleSubmit = () => {
    send({ message, threadId, assistantId });
    setMessage("");
  };

  return (
    <>
      <Sender
        ref={senderRef}
        onSubmit={handleSubmit}
        loading={isLoading}
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
        className={style?.sender}
      />
    </>
  );
}

export default AntdChatSender;
