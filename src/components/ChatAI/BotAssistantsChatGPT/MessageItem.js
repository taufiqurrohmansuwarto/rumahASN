import React from "react";
import { Flex, Typography } from "antd";
import dayjs from "dayjs";
import MarkdownReact from "@/components/MarkdownEditor/MarkdownReact";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

const { Text } = Typography;

export const MessageItem = ({ message }) => {
  const { role, content, created_at } = message;
  const isUser = role === "user";

  return (
    <Flex
      justify={isUser ? "flex-end" : "flex-start"}
      style={{ marginBottom: 16 }}
    >
      <Flex
        vertical
        gap="small"
        style={{
          maxWidth: "85%",
          background: isUser ? "#1677ff" : "#f5f5f5",
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          position: "relative",
        }}
      >
        <Text
          style={{
            color: isUser ? "#fff" : "#000000d9",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <ReactMarkdownCustom withCustom={false}>
            {content}
          </ReactMarkdownCustom>
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: isUser ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.45)",
            alignSelf: isUser ? "flex-end" : "flex-start",
            marginTop: 4,
          }}
        >
          {dayjs(created_at).format("HH:mm")}
        </Text>
      </Flex>
    </Flex>
  );
};
