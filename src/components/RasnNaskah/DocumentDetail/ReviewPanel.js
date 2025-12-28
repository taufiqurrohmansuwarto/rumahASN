import { Stack, Text, Group } from "@mantine/core";
import {
  IconBulb,
  IconCopy,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import { Alert, Button, Card, Divider, Empty, Space, Tag, message } from "antd";
import { useMemo } from "react";
import IssueCard from "./IssueCard";
import TargetStyleFeedback from "./TargetStyleFeedback";

/**
 * ReviewPanel - Right panel showing review results
 */
const ReviewPanel = ({
  review,
  issues = [],
  usersWithPrefs,
  selectedTargetUser,
  onReviewAgain,
  reviewLoading,
  documentUrl,
}) => {
  // Group issues for display
  const groupedIssues = useMemo(() => {
    const groups = {
      format: [],
      penulisan: [],
      saran: [],
    };

    (issues || []).forEach((issue) => {
      if (
        issue.severity === "critical" ||
        issue.category === "format" ||
        issue.category === "regulation"
      ) {
        groups.format.push(issue);
      } else if (issue.severity === "suggestion") {
        groups.saran.push(issue);
      } else {
        groups.penulisan.push(issue);
      }
    });

    return groups;
  }, [issues]);

  const handleCopyAll = () => {
    const allSuggestions = issues
      .filter((i) => i.suggested_text || i.suggestion)
      .map(
        (i) =>
          `${i.original_text || i.issue_text || ""} → ${
            i.suggested_text || i.suggestion
          }`
      )
      .join("\n\n");

    if (allSuggestions) {
      navigator.clipboard.writeText(allSuggestions);
      message.success("Semua saran disalin");
    }
  };

  if (!review) {
    return (
      <Card
        size="small"
        style={{ height: "calc(100vh - 240px)", overflow: "auto" }}
        styles={{ body: { padding: 12 } }}
      >
        <Empty
          description={
            <Stack align="center" gap={4}>
              <Text>Belum ada hasil review</Text>
              <Text size="xs" c="dimmed">
                Klik "Review AI" untuk memulai
              </Text>
            </Stack>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 40 }}
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      style={{ height: "calc(100vh - 240px)", overflow: "auto" }}
      styles={{ body: { padding: 12 } }}
    >
      <Stack gap={12}>
        {/* AI Summary - Compact */}
        {review.ai_summary && (
          <Group
            gap={8}
            align="flex-start"
            wrap="nowrap"
            style={{
              padding: "8px 10px",
              background: "#fefce8",
              borderRadius: 6,
              border: "1px solid #fef08a",
            }}
          >
            <IconBulb size={14} color="#ca8a04" style={{ flexShrink: 0, marginTop: 1 }} />
            <Text size="xs" c="#854d0e" style={{ lineHeight: 1.4 }}>
              {review.ai_summary}
            </Text>
          </Group>
        )}

        {/* Issues Count Header */}
        <Group gap={8} align="center">
          <Text size="xs" fw={600}>
            TEMUAN ({issues.length})
          </Text>
          {groupedIssues.format.length > 0 && (
            <Tag color="red" style={{ fontSize: 10 }}>
              Format: {groupedIssues.format.length}
            </Tag>
          )}
          {groupedIssues.penulisan.length > 0 && (
            <Tag color="orange" style={{ fontSize: 10 }}>
              Penulisan: {groupedIssues.penulisan.length}
            </Tag>
          )}
          {groupedIssues.saran.length > 0 && (
            <Tag color="blue" style={{ fontSize: 10 }}>
              Saran: {groupedIssues.saran.length}
            </Tag>
          )}
        </Group>

        {/* Issues List */}
        <div
          style={{
            maxHeight: "calc(100vh - 500px)",
            overflow: "auto",
          }}
        >
          {groupedIssues.format.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={{ ...issue, severity: "critical" }}
            />
          ))}

          {groupedIssues.penulisan.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={{ ...issue, severity: issue.severity || "major" }}
            />
          ))}

          {groupedIssues.saran.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={{ ...issue, severity: "suggestion" }}
            />
          ))}

          {issues.length === 0 && (
            <Alert
              type="success"
              message="Tidak ditemukan masalah"
              description="Dokumen sudah sesuai dengan aturan tata naskah dinas."
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        {/* Target Style Feedback */}
        {review.includes_superior_analysis && review.superior_style_suggestions && (
          <TargetStyleFeedback
            target={usersWithPrefs?.find((u) => u.user_id === selectedTargetUser)}
            feedback={review.superior_style_suggestions}
          />
        )}

        <Divider style={{ margin: "12px 0" }} />

        {/* Action Buttons */}
        <Space wrap>
          <Button
            size="small"
            icon={<IconCopy size={14} />}
            onClick={handleCopyAll}
            disabled={issues.length === 0}
          >
            Copy Semua
          </Button>
          {documentUrl && (
            <Button
              size="small"
              icon={<IconDownload size={14} />}
              onClick={() => window.open(documentUrl, "_blank")}
            >
              Download
            </Button>
          )}
          <Button
            size="small"
            icon={<IconRefresh size={14} />}
            onClick={onReviewAgain}
            loading={reviewLoading}
          >
            Review Ulang
          </Button>
        </Space>
      </Stack>
    </Card>
  );
};

export default ReviewPanel;
