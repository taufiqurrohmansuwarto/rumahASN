import React, { useState } from "react";
import { Input, Typography, Space, Button, Row, Col, message } from "antd";
import {
  PictureOutlined,
  ThunderboltOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { chat } from "@/services/bot-ai.services";

const { TextArea } = Input;
const { Title } = Typography;

const ChatInput = ({ value, onChange, onKeyPress, disabled }) => (
  <div style={{ position: "relative" }}>
    <TextArea
      placeholder="Message ChatGPT"
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      autoSize={{ minRows: 1, maxRows: 4 }}
      style={{
        borderRadius: "8px",
        padding: "12px 40px 12px 12px", // Add right padding for the button
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
        onClick={onKeyPress}
      />
    )}
  </div>
);

const SuggestionButtons = () => (
  <Space wrap size="middle" style={{ justifyContent: "center" }}>
    <Button type="text" icon={<PictureOutlined />}>
      Create image
    </Button>
    <Button type="text" icon={<ThunderboltOutlined />}>
      Surprise me
    </Button>
    <Button type="text" icon={<EditOutlined />}>
      Help me write
    </Button>
    <Button type="text" icon={<EyeOutlined />}>
      Analyze images
    </Button>
    <Button type="text" icon={<MoreOutlined />}>
      More
    </Button>
  </Space>
);

const NewChat = ({ assistantId }) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");

  const sendMessageMutation = useMutation(
    (message) => chat({ assistantId, message, threadId: null }),
    {
      onSuccess: (data) => {
        const newThreadId = data.threadId;
        router.push(
          `/asn-connect/asn-ai-chat/${assistantId}/threads/${newThreadId}`
        );
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Failed to send message"
        );
      },
    }
  );

  const handleSend = (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
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

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: "100%", background: "#ffffff" }}
    >
      <Col xs={24} sm={20} md={16} lg={12} style={{ textAlign: "center" }}>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", padding: "24px" }}
        >
          <Title level={2} style={{ margin: 0, fontWeight: 500 }}>
            What can I help with?
          </Title>

          <ChatInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onSend={handleSend}
            disabled={sendMessageMutation.isLoading}
          />

          <SuggestionButtons />
        </Space>
      </Col>
    </Row>
  );
};

export default NewChat;
