import { Button, Input, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useRouter } from "next/router";

function NewChat({ selectedAssistant, selectedThread }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["threads"]);
        if (selectedThread) {
          router.push(`/asn-connect/asn-ai-chat?threadId=${selectedThread}`);
        } else if (selectedAssistant) {
          router.push(
            `/asn-connect/asn-ai-chat?assistantId=${selectedAssistant}`
          );
        }
      },
    }
  );

  const sendingMessage = () => {
    const payload = {
      assistantId: selectedAssistant,
      message,
    };
    mutate(payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // TODO: Handle sending message
    setMessage("");
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
