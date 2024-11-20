import { Button, Input, Typography, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useRouter } from "next/router";

function NewChat({ selectedAssistant, selectedThread }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onSuccess: (data) => {
        router.push(`/asn-connect/asn-ai-chat?threadId=${data?.threadId}`);
      },
      onError: () => {
        message.error("Failed to send message");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["threads"]);
        setMessage("");
      },
    }
  );

  const sendingMessage = () => {
    const payload = {
      assistantId: selectedAssistant || null,
      threadId: selectedThread || null,
      message,
    };
    mutate(payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendingMessage();
  };

  return (
    <div style={{ height: "100%" }}>
      <Typography.Title level={4}>Assistant</Typography.Title>

      <div
        style={{
          bottom: 24,
          left: 300,
          right: 24,
          display: "flex",
          gap: 8,
        }}
      >
        <Input.TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
          onPressEnter={sendingMessage}
          disabled={isLoading}
        />
        <Button
          type="primary"
          onClick={handleSubmit}
          icon={<SendOutlined />}
          disabled={isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default NewChat;
