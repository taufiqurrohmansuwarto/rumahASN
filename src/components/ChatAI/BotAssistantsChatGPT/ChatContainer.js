import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Flex, Input, Button, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AutoSizer, List } from "react-virtualized";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { MessageItem } from "./MessageItem";
import { MessageItemSkeleton } from "./MessageItemSkeleton";

const MessageRow = memo(({ item, style }) => (
  <div style={style}>
    <MessageItem message={item} />
  </div>
));

MessageRow.displayName = "MessageRow";

export const ChatContainer = ({ assistantId, threadId, firstMessage }) => {
  const [message, setMessage] = useState("");
  const listRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
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
        if (data?.some((msg) => msg.role === "assistant")) {
          return false;
        }
        return 3000;
      },
      select: (data) => {
        let allMessages = [...(data || [])];
        if (firstMessage && allMessages.length === 0) {
          allMessages = [firstMessage];
        }
        return allMessages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      },
    }
  );

  const scrollToBottom = useCallback(() => {
    if (listRef.current && messages?.length) {
      listRef.current.scrollToRow(messages.length - 1);
    }
  }, [messages?.length]);

  // Initial scroll effect
  useEffect(() => {
    if (messages?.length && !initialScrollDone && !isLoading) {
      setTimeout(() => {
        scrollToBottom();
        setInitialScrollDone(true);
      }, 100);
    }
  }, [messages, isLoading, initialScrollDone, scrollToBottom]);

  // Scroll on new messages if near bottom
  useEffect(() => {
    if (isNearBottom && initialScrollDone) {
      scrollToBottom();
    }
  }, [messages?.length, isNearBottom, initialScrollDone, scrollToBottom]);

  const handleScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 100);
  };

  const sendMessageMutation = useMutation(
    (newMessage) =>
      AssistantAIServices.sendMessage({
        assistantId,
        threadId,
        message: newMessage,
      }),
    {
      onMutate: async (newMessage) => {
        await queryClient.cancelQueries(["messages", assistantId, threadId]);
        const previousMessages = queryClient.getQueryData([
          "messages",
          assistantId,
          threadId,
        ]);

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
        setIsNearBottom(true);
        scrollToBottom();
      },
    }
  );

  const handleSend = () => {
    if (message.trim() && !sendMessageMutation.isLoading) {
      const messageToSend = message;
      setMessage("");
      sendMessageMutation.mutate(messageToSend);
      setIsNearBottom(true);
    }
  };

  // Function to calculate row height based on content
  const getRowHeight = ({ index }) => {
    const message = messages[index];
    const content = message.content || "";

    // Base height untuk konten dan padding
    let baseHeight = 60;

    // Hitung perkiraan jumlah baris berdasarkan panjang konten dan lebar container
    const avgCharsPerLine = 60; // Perkiraan jumlah karakter per baris
    const estimatedLines = Math.ceil(content.length / avgCharsPerLine);

    // Tinggi per baris text
    const lineHeight = 24;

    // Tambahkan tinggi untuk setiap baris text
    let contentHeight = estimatedLines * lineHeight;

    // Jika pesan dari assistant, biasanya lebih kompleks (bisa ada code block, etc)
    if (message.role === "assistant") {
      contentHeight *= 1.5;
    }

    // Tambahkan padding dan minimum height
    return Math.max(baseHeight, contentHeight + 40);
  };

  const renderContent = () => {
    if (isLoading && !messages?.length) {
      return (
        <Flex
          vertical
          gap="middle"
          style={{
            padding: "24px 16px",
            height: "100%",
            overflow: "auto",
          }}
        >
          <MessageItemSkeleton isUser={true} />
          <MessageItemSkeleton isUser={false} />
          <MessageItemSkeleton isUser={true} />
        </Flex>
      );
    }

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            rowCount={messages?.length || 0}
            rowHeight={getRowHeight}
            rowRenderer={({ index, style }) => (
              <MessageRow
                item={messages[index]}
                style={{
                  ...style,
                  padding: "8px 16px",
                }}
              />
            )}
            onScroll={handleScroll}
            scrollToAlignment="end"
          />
        )}
      </AutoSizer>
    );
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
        style={{
          flex: 1,
          background: "#ffffff",
        }}
      >
        <Flex
          vertical
          style={{
            maxWidth: 850,
            margin: "0 auto",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ flex: 1, height: "calc(100vh - 140px)" }}>
            {renderContent()}
          </div>
          {sendMessageMutation.isLoading && (
            <div style={{ padding: "0 24px" }}>
              <MessageItemSkeleton isUser={false} />
            </div>
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
