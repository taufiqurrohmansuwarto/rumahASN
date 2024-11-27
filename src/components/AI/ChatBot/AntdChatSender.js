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

  const handleSubmit = () => {
    send({ message, threadId, assistantId });
    setMessage("");
  };

  const handleSelect = (value) => {
    setMessage(`[${value}]: `);
  };

  return (
    <div style={{ paddingBottom: "16px" }}>
      <Suggestion block items={suggestions} onSelect={handleSelect}>
        {({ onTrigger, onKeyDown }) => {
          return (
            <Sender
              submitType="shiftEnter"
              ref={senderRef}
              onSubmit={handleSubmit}
              loading={isLoading}
              value={message}
              onChange={(nextVal) => {
                if (nextVal === "/") {
                  onTrigger();
                } else if (!nextVal) {
                  onTrigger(false);
                }
                setMessage(nextVal);
              }}
              onKeyDown={onKeyDown}
              actions={(_, info) => {
                const { SendButton, LoadingButton, ClearButton } =
                  info.components;
                return (
                  <Space size="small">
                    <Typography.Text type="secondary">
                      <small>`Shift + Enter` untuk mengirim pesan</small>
                    </Typography.Text>
                    <ClearButton />
                    {isLoading ? <LoadingButton /> : <SendButton />}
                  </Space>
                );
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
