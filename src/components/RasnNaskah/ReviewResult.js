import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Select,
  Alert,
  Tooltip,
  message,
  Badge,
  Collapse,
  Empty,
  Spin,
} from "antd";
import {
  IconCopy,
  IconBookmark,
  IconDownload,
  IconArrowLeft,
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconBulb,
  IconCheck,
  IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRasnNaskahSuperiorPreferences } from "@/hooks/useRasnNaskah";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Severity config
const SEVERITY_CONFIG = {
  critical: {
    color: "red",
    icon: IconAlertTriangle,
    label: "FORMAT",
    bgColor: "#fff1f0",
    borderColor: "#ffa39e",
  },
  major: {
    color: "orange",
    icon: IconAlertCircle,
    label: "PENULISAN",
    bgColor: "#fff7e6",
    borderColor: "#ffd591",
  },
  minor: {
    color: "gold",
    icon: IconAlertCircle,
    label: "PENULISAN",
    bgColor: "#fffbe6",
    borderColor: "#ffe58f",
  },
  suggestion: {
    color: "blue",
    icon: IconBulb,
    label: "SARAN",
    bgColor: "#e6f7ff",
    borderColor: "#91d5ff",
  },
};

// Score badge color
const getScoreColor = (score) => {
  if (score >= 80) return "#52c41a";
  if (score >= 60) return "#faad14";
  return "#f5222d";
};

// Issue Card Component
const IssueCard = ({ issue, onCopy }) => {
  const config = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.minor;
  const Icon = config.icon;

  const handleCopy = () => {
    const textToCopy = issue.suggested_text || issue.suggestion || "";
    navigator.clipboard.writeText(textToCopy);
    message.success("Teks disalin ke clipboard");
    onCopy?.(issue);
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        background: config.bgColor,
        borderLeft: `4px solid ${config.borderColor}`,
        borderRadius: "4px",
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <Icon size={16} color={config.borderColor} />
            <Tag color={config.color}>{config.label}</Tag>
            {issue.is_resolved && (
              <Tag color="green" icon={<IconCheck size={12} />}>
                Resolved
              </Tag>
            )}
          </Space>

          {/* Rule Reference */}
          {issue.rule_reference && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {issue.rule_reference}
              </Text>
            </div>
          )}

          {/* Description */}
          {issue.description && (
            <Paragraph style={{ marginBottom: 8 }}>
              {issue.description}
            </Paragraph>
          )}

          {/* Original → Suggested */}
          {(issue.original_text || issue.suggested_text) && (
            <div
              style={{
                background: "#fff",
                padding: "8px 12px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              {issue.original_text && (
                <div style={{ marginBottom: 4 }}>
                  <Text delete type="secondary">
                    "{issue.original_text}"
                  </Text>
                </div>
              )}
              {issue.original_text && issue.suggested_text && (
                <div style={{ marginBottom: 4, color: "#999" }}>↓</div>
              )}
              {issue.suggested_text && (
                <div>
                  <Text strong style={{ color: "#52c41a" }}>
                    "{issue.suggested_text}"
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Copy button */}
        {issue.suggested_text && (
          <Tooltip title="Salin saran">
            <Button
              type="text"
              size="small"
              icon={<IconCopy size={14} />}
              onClick={handleCopy}
              style={{ marginLeft: 8 }}
            >
              Copy
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

// Superior Style Feedback Component
const SuperiorStyleFeedback = ({ superior, feedback }) => {
  if (!superior || !feedback) return null;

  return (
    <Card
      size="small"
      style={{
        marginTop: 16,
        background: "#f6ffed",
        borderColor: "#b7eb8f",
      }}
    >
      <Space align="center" style={{ marginBottom: 8 }}>
        <IconUser size={16} color="#52c41a" />
        <Text strong>GAYA BAHASA - {superior.superior_name}</Text>
      </Space>

      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        {superior.superior_position && `${superior.superior_position} - `}
        {superior.notes || `Prefer kalimat ${superior.language_style === "ringkas" ? "ringkas dan to the point" : superior.language_style}`}
      </Paragraph>

      {feedback.suggestions?.map((item, index) => (
        <Alert
          key={index}
          type={feedback.is_compliant ? "success" : "warning"}
          message={item.issue}
          description={item.suggestion}
          showIcon
          style={{ marginBottom: 8 }}
        />
      ))}

      {feedback.overall_note && (
        <div style={{ marginTop: 8, padding: 8, background: "#fff", borderRadius: 4 }}>
          <IconCheck size={14} color="#52c41a" style={{ marginRight: 4 }} />
          <Text type="secondary">{feedback.overall_note}</Text>
        </div>
      )}
    </Card>
  );
};

// Main ReviewResult Component
const ReviewResult = ({
  document,
  review,
  issues = [],
  onBack,
  onBookmark,
  onDownload,
  loading = false,
}) => {
  const [selectedSuperior, setSelectedSuperior] = useState(review?.target_superior_id || null);
  const { data: superiors } = useRasnNaskahSuperiorPreferences();

  // Group issues by UI category
  const groupedIssues = useMemo(() => {
    const groups = {
      format: [],
      penulisan: [],
      saran: [],
    };

    (issues || []).forEach((issue) => {
      if (issue.severity === "critical" || issue.category === "format" || issue.category === "regulation") {
        groups.format.push(issue);
      } else if (issue.severity === "suggestion") {
        groups.saran.push(issue);
      } else {
        groups.penulisan.push(issue);
      }
    });

    return groups;
  }, [issues]);

  // Copy all suggestions
  const handleCopyAll = () => {
    const allSuggestions = issues
      .filter((i) => i.suggested_text)
      .map((i) => `${i.original_text || ""} → ${i.suggested_text}`)
      .join("\n\n");

    navigator.clipboard.writeText(allSuggestions);
    message.success("Semua saran disalin ke clipboard");
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Memproses review...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!review) {
    return (
      <Card>
        <Empty description="Belum ada hasil review" />
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            {onBack && (
              <Button type="text" icon={<IconArrowLeft size={16} />} onClick={onBack}>
                Upload & Review
              </Button>
            )}
            {onDownload && (
              <Button type="text" icon={<IconDownload size={16} />} onClick={onDownload}>
                Download
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Document Info & Score */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Space align="center">
              <Text strong style={{ fontSize: 16 }}>
                📄 {document?.original_file_name || document?.title || "Dokumen"}
              </Text>
            </Space>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                {document?.category_label || document?.category || "Nota Dinas"} •{" "}
                {dayjs(document?.created_at).format("DD MMMM YYYY")}
              </Text>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Text strong style={{ fontSize: 16 }}>
              Skor:{" "}
            </Text>
            <Badge
              count={`${review?.score || 0}/100`}
              style={{
                backgroundColor: getScoreColor(review?.score || 0),
                fontSize: 14,
                padding: "0 8px",
              }}
            />
          </div>
        </div>
      </Card>

      {/* AI Summary */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          background: "#fffbe6",
          borderColor: "#ffe58f",
        }}
      >
        <Space align="start">
          <IconBulb size={16} color="#faad14" style={{ marginTop: 2 }} />
          <div>
            <Text strong style={{ color: "#d48806" }}>
              RINGKASAN AI
            </Text>
            <Paragraph style={{ marginBottom: 0, marginTop: 4 }}>
              {review?.ai_summary || "Tidak ada ringkasan tersedia."}
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* Superior Selector */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Text>🎯 Tujuan:</Text>
          <Select
            placeholder="Pilih atasan ▼"
            style={{ minWidth: 200 }}
            allowClear
            value={selectedSuperior}
            onChange={setSelectedSuperior}
            options={[
              { value: null, label: "Tanpa preferensi atasan" },
              ...(superiors?.data || []).map((s) => ({
                value: s.id,
                label: s.superior_name,
              })),
            ]}
          />
          <Text type="secondary">→ untuk saran gaya bahasa</Text>
        </Space>
      </Card>

      <Divider style={{ margin: "16px 0" }} />

      {/* Issues Count */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>📋 TEMUAN ({issues?.length || 0})</Text>
      </div>

      {/* Grouped Issues */}
      {groupedIssues.format.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {groupedIssues.format.map((issue) => (
            <IssueCard key={issue.id} issue={{ ...issue, severity: "critical" }} />
          ))}
        </div>
      )}

      {groupedIssues.penulisan.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {groupedIssues.penulisan.map((issue) => (
            <IssueCard key={issue.id} issue={{ ...issue, severity: "major" }} />
          ))}
        </div>
      )}

      {groupedIssues.saran.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {groupedIssues.saran.map((issue) => (
            <IssueCard key={issue.id} issue={{ ...issue, severity: "suggestion" }} />
          ))}
        </div>
      )}

      {issues?.length === 0 && (
        <Alert
          type="success"
          message="Tidak ditemukan masalah"
          description="Dokumen sudah sesuai dengan aturan tata naskah dinas."
          showIcon
        />
      )}

      <Divider style={{ margin: "16px 0" }} />

      {/* Superior Style Feedback */}
      {review?.includes_superior_analysis && review?.superior_style_suggestions && (
        <SuperiorStyleFeedback
          superior={review?.targetSuperior || superiors?.data?.find((s) => s.id === selectedSuperior)}
          feedback={review?.superior_style_suggestions}
        />
      )}

      <Divider style={{ margin: "16px 0" }} />

      {/* Action Buttons */}
      <Space>
        <Button icon={<IconCopy size={14} />} onClick={handleCopyAll}>
          Copy Semua Saran
        </Button>
        {onBookmark && (
          <Button icon={<IconBookmark size={14} />} onClick={onBookmark}>
            Tandai
          </Button>
        )}
        {onDownload && (
          <Button type="primary" icon={<IconDownload size={14} />} onClick={onDownload}>
            Download Hasil
          </Button>
        )}
      </Space>
    </div>
  );
};

export default ReviewResult;
