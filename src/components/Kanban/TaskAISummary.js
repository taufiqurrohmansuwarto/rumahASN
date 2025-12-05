import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Typography, Spin, Flex, Tooltip } from "antd";
import { IconSparkles, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { aiTaskSummary } from "../../../services/kanban.services";

const { Text } = Typography;

function TaskAISummary({ task }) {
  const [summary, setSummary] = useState(null);

  const { mutate, isLoading } = useMutation(() => aiTaskSummary(task?.id), {
    onSuccess: (data) => {
      setSummary(data?.data);
    },
    onError: () => {
      setSummary({ error: true });
    },
  });

  // Build context from task data
  const hasData =
    task?.subtasks?.length > 0 ||
    task?.comments?.length > 0 ||
    task?.attachments?.length > 0 ||
    task?.time_entries?.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div
      style={{
        padding: "8px 12px",
        backgroundColor: "#fff7e6",
        borderRadius: 8,
        border: "1px solid #ffd591",
        marginTop: 12,
      }}
    >
      <Flex justify="space-between" align="center" gap={8}>
        <Flex align="center" gap={6} style={{ flex: 1 }}>
          <IconSparkles size={14} color="#fa541c" />
          {isLoading ? (
            <Flex align="center" gap={6}>
              <Spin size="small" />
              <Text type="secondary" style={{ fontSize: 11 }}>
                AI sedang meringkas...
              </Text>
            </Flex>
          ) : summary && !summary.error ? (
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, lineHeight: 1.5 }}>
                {summary.summary}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 10, display: "block", marginTop: 2 }}
              >
                Diringkas: {dayjs(summary.generated_at).format("DD MMM HH:mm")}
              </Text>
            </div>
          ) : summary?.error ? (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Gagal meringkas. Coba lagi.
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Ringkas progress task dengan AI
            </Text>
          )}
        </Flex>

        <Tooltip title={summary ? "Refresh ringkasan" : "Ringkas dengan AI"}>
          <Button
            type="text"
            size="small"
            icon={
              summary ? <IconRefresh size={14} /> : <IconSparkles size={14} />
            }
            onClick={() => mutate()}
            loading={isLoading}
            style={{
              color: "#fa541c",
              height: 24,
              width: 24,
              padding: 0,
            }}
          />
        </Tooltip>
      </Flex>
    </div>
  );
}

export default TaskAISummary;
