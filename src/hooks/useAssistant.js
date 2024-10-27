import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { message as antMessage } from "antd";
import axios from "axios";

export const useAssistant = ({ api }) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(null);

  const mutation = useMutation({
    mutationFn: async (message) => {
      try {
        setStatus("loading");

        // Add user message immediately
        const userMessage = {
          role: "user",
          content: message,
        };
        setMessages((prev) => [...prev, userMessage]);

        const response = await axios.post(api, {
          message,
          threadId,
        });

        // Handle successful response
        const data = response.data;

        // Save threadId if it's new
        if (data.threadId) {
          setThreadId(data.threadId);
        }

        // Add assistant message
        if (data.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.message.id,
              role: data.message.role,
              content: data.message.content,
            },
          ]);
        }

        setStatus("idle");
        return data;
      } catch (error) {
        setStatus("error");
        antMessage.error(error.message || "Failed to send message");
        throw error;
      }
    },
  });

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const submitMessage = useCallback(
    async (e) => {
      e?.preventDefault();

      if (!input.trim()) {
        antMessage.warning("Please enter a message");
        return;
      }

      try {
        await mutation.mutateAsync(input);
        setInput("");
      } catch (error) {
        console.error("Error submitting message:", error);
      }
    },
    [input, mutation]
  );

  return {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    isLoading: mutation.isLoading,
    isError: status === "error",
    clearMessages: () => {
      setMessages([]);
      setThreadId(null);
    },
  };
};
