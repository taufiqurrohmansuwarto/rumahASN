import { AssistantAIServices } from "@/services/assistant-ai.services";
import useChatStore from "@/store/useChat";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flex, Space, Typography } from "antd";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Sender from "../Sender";
import Suggestion from "../Suggestion";
import suggestions from "./suggestions";

function AntdChatSender({ style }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const senderRef = useRef(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const { threadId } = router.query;

  const { setSendSuccess, setLastId } = useChatStore();

  const { mutate: send, isLoading } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onMutate: async ({ message }) => {
        if (threadId) {
          await queryClient.cancelQueries(["chat-messages", threadId]);
          const previousMessages = queryClient.getQueryData([
            "chat-messages",
            threadId,
          ]);
          const lastId = previousMessages[previousMessages.length - 1].id;
          queryClient.setQueryData(["chat-messages", threadId], (old) => [
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
          ]);
          setLastId(lastId);
          return { previousMessages };
        }
      },
      onError: (err, newMessage, context) => {
        queryClient.setQueryData(
          ["chat-messages", threadId],
          context.previousMessages
        );
      },
      onSettled: () => {
        if (threadId) {
          queryClient.invalidateQueries(["chat-messages", threadId]);
          setSendSuccess(false);
        }
      },
      onSuccess: (data) => {
        if (threadId) {
          setSendSuccess(true);
          setLastId(data.id);
        } else {
          queryClient.invalidateQueries(["threads"]);
          router.push(`/chat-ai/${data?.threadId}`);
        }
      },
    }
  );

  const handleSubmit = (msg) => {
    if (!isSuggestionOpen) {
      send({ message: msg, threadId });
      setMessage("");
    }
  };

  const handleSelect = (value) => {
    setMessage(`[${value}]: `);
  };

  return (
    <div style={{ paddingBottom: "16px" }}>
      <Suggestion items={suggestions} onSelect={handleSelect}>
        {({ onTrigger, onKeyDown }) => {
          return (
            <Sender
              placeholder="Tulis pesan..."
              className={style?.sender}
              submitType="enter"
              ref={senderRef}
              onSubmit={handleSubmit}
              loading={isLoading}
              value={message}
              onChange={(nextVal) => {
                if (nextVal === "/") {
                  onTrigger();
                  setIsSuggestionOpen(true);
                } else if (!nextVal) {
                  onTrigger(false);
                  setIsSuggestionOpen(false);
                }
                setMessage(nextVal);
              }}
              onKeyDown={(e) => {
                onKeyDown(e);
                if (e.key === "Enter" && !e.shiftKey) {
                  if (isSuggestionOpen) {
                    e.preventDefault();
                    setIsSuggestionOpen(false);
                  }
                }
              }}
            />
          );
        }}
      </Suggestion>

      <Flex justify="center" align="center" style={{ marginTop: "8px" }}>
        <Typography.Text type="secondary">
          <Space>
            <InfoCircleOutlined />
            <span>
              BestieAI dapat melakukan kesalahan. Mohon periksa ulang setiap
              informasi penting secara mandiri.
            </span>
          </Space>
        </Typography.Text>
      </Flex>
    </div>
  );
}

export default AntdChatSender;
