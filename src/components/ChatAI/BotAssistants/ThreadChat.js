import { chat, getThreadMessages } from "@/services/bot-ai.services";
import {
  ArrowUpOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Input, Spin, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useStyles } from "./styles";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

const { Text } = Typography;
const { TextArea } = Input;

const TypingIndicator = () => (
  <div className="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
    <style jsx>{`
      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: #f5f5f5;
        border-radius: 8px;
        width: fit-content;
      }
      span {
        width: 6px;
        height: 6px;
        background: #666;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
        display: inline-block;
      }
      span:nth-child(1) {
        animation-delay: -0.32s;
      }
      span:nth-child(2) {
        animation-delay: -0.16s;
      }
      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-6px);
        }
      }
    `}</style>
  </div>
);

const ChatInput = ({ value, onChange, onKeyPress, onSend, disabled }) => (
  <div style={{ position: "relative" }}>
    <TextArea
      placeholder="Type a message..."
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      autoSize={{ minRows: 1, maxRows: 4 }}
      style={{
        borderRadius: "8px",
        padding: "12px 40px 12px 12px",
        resize: "none",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
      }}
    />
    {value.trim() && (
      <Button
        type="primary"
        shape="circle"
        icon={<ArrowUpOutlined />}
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onSend}
        disabled={disabled}
      />
    )}
  </div>
);

const ThreadChat = ({ assistantId, threadId }) => {
  const { styles } = useStyles();
  const [inputValue, setInputValue] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const scrollToBottom = () => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  };

  const { data: messages, isLoading } = useQuery(
    ["messages", assistantId, threadId],
    () => getThreadMessages({ assistantId, threadId }),
    {
      enabled: !!assistantId && !!threadId,
      refetchInterval: 3000,
      onSuccess: (newMessages) => {
        // Check if new messages were added
        const prevMessages = queryClient.getQueryData([
          "messages",
          assistantId,
          threadId,
        ]);
        if (!prevMessages || newMessages?.length !== prevMessages?.length) {
          scrollToBottom();
        }
      },
    }
  );

  const sendMessageMutation = useMutation(
    (message) => chat({ assistantId, threadId, message }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["messages", assistantId, threadId]);
        setInputValue("");
        setShouldScrollToBottom(true); // Force scroll to bottom after sending
      },
      onError: () => {
        message.error("Failed to send message");
      },
    }
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

  const handleSend = () => {
    if (inputValue.trim() && !sendMessageMutation.isLoading) {
      sendMessageMutation.mutate(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.threadChatLayout}>
      <div
        className={styles.messagesContainer}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <div className={styles.messagesList}>
          {messages?.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? styles.messageWrapperRight
                  : styles.messageWrapper
              }
            >
              <Avatar
                size="large"
                icon={
                  msg.role === "user" ? <UserOutlined /> : <RobotOutlined />
                }
                className={
                  msg.role === "user" ? styles.userAvatar : styles.botAvatar
                }
              />
              <div
                className={
                  msg.role === "user"
                    ? styles.messageContentRight
                    : styles.messageContent
                }
              >
                <ReactMarkdownCustom>{msg?.content}</ReactMarkdownCustom>
              </div>
            </div>
          ))}
          {sendMessageMutation.isLoading && (
            <div className={styles.messageWrapper}>
              <Avatar
                size="large"
                icon={<RobotOutlined />}
                className={styles.botAvatar}
              />
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputContainer}>
        <ChatInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onSend={handleSend}
          disabled={sendMessageMutation.isLoading}
        />
      </div>
    </div>
  );
};

export default ThreadChat;
