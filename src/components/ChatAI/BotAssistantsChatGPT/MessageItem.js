import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Flex, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export const MessageItem = ({ message }) => {
  const { role, content, created_at } = message;
  const isUser = role === "user";

  return (
    <Flex
      justify={isUser ? "flex-end" : "flex-start"}
      style={{ marginBottom: 24, marginTop: 8 }}
    >
      <Flex
        vertical
        gap="small"
        style={{
          maxWidth: "85%",
          background: isUser ? "#d9d9d9" : "#f0f0f0",
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          position: "relative",
        }}
      >
        <ReactMarkdownCustom withCustom={false}>{content}</ReactMarkdownCustom>
        <Text
          style={{
            fontSize: 11,
          }}
        >
          {dayjs(created_at).format("HH:mm")}
        </Text>
      </Flex>
    </Flex>
  );
};
