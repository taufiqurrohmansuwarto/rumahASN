import React from "react";
import { Flex, Typography } from "antd";
const { Text } = Typography;

export const MessageItemSkeleton = ({ isUser }) => (
  <Flex
    justify={isUser ? "flex-end" : "flex-start"}
    style={{ marginBottom: 16 }}
  >
    <Flex
      style={{
        maxWidth: "85%",
        background: isUser ? "#1677ff" : "#f5f5f5",
        padding: "12px 16px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        opacity: 0.7,
      }}
    >
      <Text
        style={{
          color: isUser ? "#fff" : "#000000d9",
          fontSize: 14,
        }}
      >
        ●●●
      </Text>
    </Flex>
  </Flex>
);
