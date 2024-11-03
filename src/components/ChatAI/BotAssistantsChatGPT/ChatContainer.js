import { AssistantAIServices } from "@/services/assistant-ai.services";
import { SendOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Input, Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageItem } from "./MessageItem";
import { MessageItemSkeleton } from "./MessageItemSkeleton";

export const ChatContainer = ({ assistantId, threadId, firstMessage }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
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
      refetchInterval: (data) => {
        // Stop polling jika sudah ada response dari assistant
        if (data?.some((msg) => msg.role === "assistant")) {
          return false;
        }
        return 3000;
      },
      select: (data) => {
        let allMessages = [...(data || [])];

        // Jika ini adalah thread baru dan ada firstMessage
        if (firstMessage && allMessages.length === 0) {
          allMessages = [firstMessage];
        }

        return allMessages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      },
    }
  );

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [shouldScrollToBottom]);

  useEffect(() => {
    const currentContainer = chatContainerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
      return () => currentContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, []);

  const sendMessageMutation = useMutation(
    (newMessage) =>
      AssistantAIServices.sendMessage({
        assistantId,
        threadId,
        message: newMessage,
      }),
    {
      onMutate: async (newMessage) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(["messages", assistantId, threadId]);

        // Snapshot the previous value
        const previousMessages = queryClient.getQueryData([
          "messages",
          assistantId,
          threadId,
        ]);

        // Optimistically update to the new value
        const optimisticMessage = {
          id: Date.now().toString(),
          content: newMessage,
          role: "user",
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData(
          ["messages", assistantId, threadId],
          (old = []) => [...old, optimisticMessage]
        );

        // Return a context object with the snapshotted value
        return { previousMessages };
      },
      onError: (err, newMessage, context) => {
        queryClient.setQueryData(
          ["messages", assistantId, threadId],
          context.previousMessages
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["messages", assistantId, threadId]);
        setShouldScrollToBottom(true);
      },
    }
  );

  const handleSend = () => {
    if (message.trim() && !sendMessageMutation.isLoading) {
      const messageToSend = message;
      setMessage(""); // Clear input immediately
      sendMessageMutation.mutate(messageToSend);
      setShouldScrollToBottom(true);
    }
  };

  if (error) {
    return (
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Typography.Text type="danger">
          Error loading messages: {error.message}
        </Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ height: "100%" }}>
      <Flex
        vertical
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "24px 16px",
          background: "#ffffff",
          scrollBehavior: "smooth",
        }}
      >
        <Flex
          vertical
          style={{
            maxWidth: 850,
            margin: "0 auto",
            width: "100%",
            minHeight: "100%",
          }}
        >
          {isLoading && !firstMessage ? (
            <Flex vertical gap="middle" style={{ padding: "20px 0" }}>
              <MessageItemSkeleton isUser={false} />
              <MessageItemSkeleton isUser={true} />
              <MessageItemSkeleton isUser={false} />
            </Flex>
          ) : (
            <Flex vertical style={{ marginTop: "auto" }}>
              {messages?.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {sendMessageMutation.isLoading && (
                <MessageItemSkeleton isUser={false} />
              )}
              <div ref={messagesEndRef} style={{ height: 1 }} />
            </Flex>
          )}
        </Flex>
      </Flex>

      <Flex
        style={{
          padding: 16,
          background: "#ffffff",
          borderTop: "1px solid #f0f0f0",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Flex
          gap="small"
          style={{
            maxWidth: 850,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Input.TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sendMessageMutation.isLoading || isLoading}
            style={{
              flex: 1,
              resize: "none",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sendMessageMutation.isLoading}
            disabled={!message.trim() || isLoading}
            style={{
              height: "auto",
              borderRadius: 8,
              padding: "8px 16px",
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
