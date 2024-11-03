import React from "react";
import { Flex, Input, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";

const { Title } = Typography;

export const NewChat = ({ onStartChat, assistantId }) => {
  const queryClient = useQueryClient();

  const createThreadMutation = useMutation(
    async ({ message }) => {
      const response = await AssistantAIServices.sendMessage({
        assistantId,
        message,
      });
      return {
        ...response,
        initialMessage: message, // Menyimpan pesan awal untuk ditampilkan di ChatContainer
      };
    },
    {
      onSuccess: (data) => {
        // Invalidate dan update queries
        queryClient.invalidateQueries(["threads", assistantId]);
        // Langsung set thread baru sebagai active thread
        onStartChat(data);
      },
    }
  );

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.value.trim()) {
      e.preventDefault();
      const message = e.target.value.trim();
      e.target.value = "";
      await createThreadMutation.mutate({ message });
    }
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap="large"
      style={{
        height: "100%",
        padding: "0 16px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <Title level={2}>What can I help with?</Title>
      <Input.TextArea
        placeholder="Message ChatGPT"
        autoSize={{ minRows: 1, maxRows: 4 }}
        onKeyDown={handleKeyPress}
        disabled={createThreadMutation.isLoading}
        style={{
          width: "100%",
          maxWidth: 650,
          borderRadius: 8,
          resize: "none",
        }}
      />
    </Flex>
  );
};
