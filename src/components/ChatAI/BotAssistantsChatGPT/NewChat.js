import React, { useState } from "react";
import { Flex, Input, Typography, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // tambahkan useQueryClient
import { AssistantAIServices } from "@/services/assistant-ai.services";

const { Title } = Typography;

export const NewChat = ({ onStartChat, assistantId }) => {
  const [inputValue, setInputValue] = useState("");
  const queryClient = useQueryClient();

  const createChatMutation = useMutation({
    mutationFn: async (message) => {
      if (!assistantId) {
        throw new Error("Please select an assistant first");
      }
      return AssistantAIServices.sendMessage({
        assistantId,
        message,
      });
    },
    onSuccess: (response) => {
      if (response?.thread?.id) {
        // asumsi response memiliki format yang benar
        // Invalidate threads query untuk memperbarui chat history
        queryClient.invalidateQueries(["threads", assistantId]);

        // Set active thread dengan data lengkap
        onStartChat({
          id: response.thread.id,
          title: response.thread.title || "New Chat",
          created_at: new Date().toISOString(),
          firstMessage: {
            id: response.message.id,
            content: inputValue,
            role: "user",
            created_at: new Date().toISOString(),
          },
        });
      }
    },
    onError: (error) => {
      message.error(error.message || "Failed to create new chat");
    },
  });

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      createChatMutation.mutate(inputValue.trim());
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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Message ChatGPT"
        autoSize={{ minRows: 1, maxRows: 4 }}
        onKeyDown={handleKeyPress}
        disabled={createChatMutation.isLoading}
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
