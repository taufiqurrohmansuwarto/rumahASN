import { useAssistant } from "@/hooks/useAssistant";
import {
  DeleteOutlined,
  OpenAIOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Input, Typography } from "antd";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
const { Text } = Typography;

// Animasi untuk loading dots
const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 12px;
  margin: 8px 0;

  .dot {
    width: 4px;
    height: 4px;
    margin: 0 2px;
    background: #666;
    border-radius: 50%;
    animation: blink 1.4s infinite both;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0% {
      opacity: 0.2;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-direction: ${(props) => (props.isUser ? "row-reverse" : "row")};

  .avatar {
    flex-shrink: 0;
    margin: ${(props) => (props.isUser ? "0 0 0 8px" : "0 8px 0 0")};
  }

  .message-content {
    max-width: 70%;
    display: flex;
    flex-direction: column;
  }
`;

const ChatBubble = styled.div`
  padding: 12px 16px;
  background-color: ${(props) => (props.isUser ? "#1890ff" : "#fff")};
  border-radius: 12px;
  border-top-${(props) => (props.isUser ? "right" : "left")}-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  color: ${(props) => (props.isUser ? "#fff" : "rgba(0, 0, 0, 0.85)")};
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const AssistantChat = ({ height = 600 }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    isLoading,
    clearMessages,
  } = useAssistant({
    api: "/helpdesk/api/assistant/bot",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Calculate chat container height
  const inputAreaHeight = 90; // Approximate height of input area
  const chatHeight = height - inputAreaHeight;

  return (
    <>
      <Card
        style={{
          height: `${height}px`,
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
        bodyStyle={{
          padding: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          style={{
            height: `${chatHeight}px`,
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#f5f5f5",
            flex: 1,
          }}
        >
          {messages.map((msg, index) => (
            <MessageContainer key={index} isUser={msg.role === "user"}>
              <Avatar
                className="avatar"
                size="small"
                icon={
                  msg.role === "user" ? <UserOutlined /> : <OpenAIOutlined />
                }
                style={{
                  backgroundColor: msg.role === "user" ? "#1890ff" : "#52c41a",
                }}
              />
              <div className="message-content">
                <ChatBubble isUser={msg.role === "user"}>
                  <ReactMarkdownCustom>{msg.content}</ReactMarkdownCustom>
                </ChatBubble>
              </div>
            </MessageContainer>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <MessageContainer>
              <Avatar
                className="avatar"
                size="small"
                icon={<OpenAIOutlined />}
                style={{ backgroundColor: "#52c41a" }}
              />
              <LoadingDots>
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </LoadingDots>
            </MessageContainer>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Silahkan masukkan pesan..."
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  submitMessage(e);
                }
              }}
              disabled={isLoading}
              style={{
                borderRadius: "20px",
                padding: "8px 16px",
              }}
            />
            <Button
              type="primary"
              onClick={submitMessage}
              disabled={!input.trim() || isLoading}
              icon={<SendOutlined />}
              style={{
                borderRadius: "20px",
                width: "50px",
                height: "40px",
                padding: 0,
                minWidth: "50px",
              }}
            />
            <Button
              onClick={clearMessages}
              icon={<DeleteOutlined />}
              style={{
                borderRadius: "20px",
                width: "40px",
                height: "40px",
                padding: 0,
                minWidth: "40px",
              }}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default AssistantChat;
