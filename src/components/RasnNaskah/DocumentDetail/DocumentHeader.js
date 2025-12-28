import { Group, Text, Stack } from "@mantine/core";
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconClipboard,
  IconFile,
  IconUser,
} from "@tabler/icons-react";
import { Badge, Button, Select, Tag } from "antd";
import dayjs from "dayjs";

/**
 * Get score badge color
 */
const getScoreColor = (score) => {
  if (score >= 80) return "#52c41a";
  if (score >= 60) return "#faad14";
  return "#f5222d";
};

/**
 * Get status display config
 */
const getStatusConfig = (status) => {
  const configs = {
    draft: { color: "default", label: "Draf" },
    pending_review: { color: "processing", label: "Menunggu Review" },
    reviewing: { color: "warning", label: "Sedang Direview" },
    reviewed: { color: "success", label: "Sudah Direview" },
  };
  return configs[status] || { color: "default", label: status };
};

/**
 * Get language style label
 */
const getLanguageStyleLabel = (style) => {
  const labels = {
    formal_lengkap: "Formal lengkap",
    formal_ringkas: "Ringkas",
    semi_formal: "Semi-formal",
    formal: "Formal",
    standar: "Standar",
  };
  return labels[style] || style;
};

const DocumentHeader = ({
  doc,
  review,
  usersWithPrefs,
  selectedTargetUser,
  onSelectTargetUser,
  onBack,
  onBookmark,
  onReview,
  bookmarkLoading,
  reviewLoading,
  pendingReview,
}) => {
  const statusConfig = getStatusConfig(doc?.status);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        padding: "12px 16px",
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
      }}
    >
      {/* Left Section - Document Info */}
      <Group gap={12} align="center" style={{ flex: "1 1 auto", minWidth: 200 }}>
        <Button
          type="text"
          icon={<IconArrowLeft size={16} />}
          onClick={onBack}
          style={{ flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <Group gap={8} align="center" wrap="nowrap" mb={4}>
            <IconFile size={18} color="#6b7280" style={{ flexShrink: 0 }} />
            <Text
              size="sm"
              fw={600}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 300,
              }}
            >
              {doc?.title || "Dokumen"}
            </Text>
            <Tag color={statusConfig.color} style={{ flexShrink: 0 }}>
              {statusConfig.label}
            </Tag>
          </Group>
          <Text size="xs" c="dimmed">
            {doc?.document_number || "-"} •{" "}
            {dayjs(doc?.created_at).format("DD MMM YYYY")}
          </Text>
        </div>
      </Group>

      {/* Right Section - Actions */}
      <Group gap={12} align="center" wrap="nowrap" style={{ flexShrink: 0 }}>
        {/* Score Badge */}
        {review && (
          <Stack gap={2} align="center" style={{ minWidth: 60 }}>
            <Text size="xs" c="dimmed">
              Skor
            </Text>
            <Badge
              count={`${review.score || 0}/100`}
              style={{
                backgroundColor: getScoreColor(review.score || 0),
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </Stack>
        )}

        {/* Target User Selector */}
        <Stack gap={2} style={{ minWidth: 180 }}>
          <Text size="xs" c="dimmed">
            Tujuan:
          </Text>
          <Select
            size="small"
            placeholder="Tanpa preferensi"
            allowClear
            value={selectedTargetUser}
            onChange={onSelectTargetUser}
            style={{ width: "100%" }}
            optionLabelProp="label"
          >
            <Select.Option value={null} label="Tanpa preferensi">
              <Text size="xs">Tanpa preferensi</Text>
            </Select.Option>
            {usersWithPrefs?.map((user) => (
              <Select.Option
                key={user.id}
                value={user.user_id}
                label={user.user_name}
              >
                <Group gap={8} align="center">
                  <IconUser size={14} />
                  <div style={{ flex: 1 }}>
                    <Text size="xs" fw={500}>
                      {user.user_name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {getLanguageStyleLabel(user.language_style)}
                    </Text>
                  </div>
                </Group>
              </Select.Option>
            ))}
          </Select>
        </Stack>

        {/* Action Buttons */}
        <Group gap={8} wrap="nowrap">
          <Button
            icon={
              doc?.is_bookmarked ? (
                <IconBookmarkFilled size={16} />
              ) : (
                <IconBookmark size={16} />
              )
            }
            onClick={onBookmark}
            loading={bookmarkLoading}
          />
          {pendingReview ? (
            <Button loading>Sedang Review...</Button>
          ) : (
            <Button
              type="primary"
              icon={<IconClipboard size={16} />}
              onClick={onReview}
              loading={reviewLoading}
            >
              Review AI
            </Button>
          )}
        </Group>
      </Group>
    </div>
  );
};

export default DocumentHeader;
