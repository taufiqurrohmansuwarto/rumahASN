import { getThreads } from "@/services/bot-ai.services";
import { SettingOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, List, message, Spin, Typography } from "antd";
import { useRouter } from "next/router";

const { Text } = Typography;

const ChatHistory = ({ assistantId }) => {
  const router = useRouter();
  const currentThreadId = router.query?.threadId;

  const { data: threads, isLoading } = useQuery(
    ["threads", assistantId],
    () => getThreads(assistantId),
    {
      enabled: !!assistantId,
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Failed to fetch threads"
        );
      },
    }
  );

  const handleThreadClick = (threadId) => {
    router.push(`/asn-connect/asn-ai-chat/${assistantId}/threads/${threadId}`);
  };

  return (
    <div>
      <div>
        <Text type="secondary">Riwayat Chat</Text>
        <Button type="text" icon={<SettingOutlined />} size="small" />
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        <Spin spinning={isLoading}>
          <List
            size="small"
            dataSource={threads || []}
            renderItem={(thread) => (
              <List.Item
                onClick={() => handleThreadClick(thread.id)}
                style={{
                  padding: "12px 8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  background:
                    currentThreadId === thread.id ? "#f5f5f5" : "transparent",
                  marginBottom: "4px",
                  border: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Text>{thread.title || "New Chat"}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(thread.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </Spin>
      </div>
    </div>
  );
};

export default ChatHistory;
