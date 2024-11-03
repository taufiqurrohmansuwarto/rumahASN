import { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Empty, Flex, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id"; // Jika ingin menggunakan bahasa Indonesia
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingState } from "./LoadingState";
import { useThreads } from "./hooks/useThreads";

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.locale("id"); // Jika ingin menggunakan bahasa Indonesia

const { Text, Paragraph } = Typography;

export const ChatHistory = ({
  assistantId,
  activeThread,
  onSelectThread,
  onNewChat,
}) => {
  const { threads, isLoading } = useThreads(assistantId);

  if (!assistantId) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ height: "100%", padding: 24 }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Please select an assistant to start chatting"
        />
      </Flex>
    );
  }

  if (isLoading) {
    return <LoadingState tip="Loading chats..." />;
  }

  const formatDate = (date) => {
    return dayjs(date).calendar(null, {
      sameDay: "[Today]",
      lastDay: "[Yesterday]",
      lastWeek: "dddd",
      sameElse: "D MMMM YYYY",
    });
  };

  // Group chats by date
  const groupedThreads = threads?.reduce((groups, thread) => {
    const date = formatDate(thread.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(thread);
    return groups;
  }, {});

  return (
    <Flex vertical style={{ height: "100%" }}>
      {/* New Chat Button */}
      <Flex
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={onNewChat}
          style={{
            height: 48,
            fontSize: 16,
            borderRadius: 8,
          }}
        >
          New Chat
        </Button>
      </Flex>

      {/* Chat List */}
      <Flex
        vertical
        style={{
          flex: 1,
          overflow: "auto",
          padding: "8px 8px 16px",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            margin: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(0, 0, 0, 0.2)",
            },
          },
        }}
      >
        {Object.entries(groupedThreads || {}).map(([date, dateThreads]) => (
          <Flex vertical key={date} style={{ marginBottom: 16 }}>
            {/* Date Header */}
            <Text
              type="secondary"
              style={{
                padding: "8px 16px",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {date}
            </Text>

            {/* Thread Items */}
            {dateThreads.map((thread) => (
              <Flex
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                style={{
                  padding: "12px 16px",
                  margin: "2px 4px",
                  cursor: "pointer",
                  borderRadius: 8,
                  background:
                    thread.id === activeThread?.id
                      ? "rgba(22, 119, 255, 0.1)"
                      : "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      thread.id === activeThread?.id
                        ? "rgba(22, 119, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              >
                <Flex vertical gap="small" style={{ width: "100%" }}>
                  {/* Thread Header */}
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap="small">
                      <MessageOutlined
                        style={{
                          color:
                            thread.id === activeThread?.id
                              ? "#1677ff"
                              : "#8c8c8c",
                        }}
                      />
                      <Text
                        strong
                        style={{
                          color:
                            thread.id === activeThread?.id
                              ? "#1677ff"
                              : "inherit",
                        }}
                      >
                        {thread.title || "New Chat"}
                      </Text>
                    </Flex>
                    <Tooltip title={dayjs(thread.created_at).format("HH:mm")}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(thread.created_at).fromNow()}
                      </Text>
                    </Tooltip>
                  </Flex>

                  {/* Thread Preview */}
                  {thread.last_message && (
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      type="secondary"
                      style={{
                        fontSize: 12,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {thread.last_message}
                    </Paragraph>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>
        ))}

        {/* Empty State */}
        {(!threads || threads.length === 0) && (
          <Flex
            vertical
            align="center"
            justify="center"
            style={{ height: "100%", padding: 24 }}
          >
            <Empty description="No chat history yet" />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
