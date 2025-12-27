import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  useRasnNaskahDocumentDetail,
  useRasnNaskahDocumentReview,
  useRasnNaskahUsersWithPreferences,
} from "@/hooks/useRasnNaskah";
import {
  startReview,
  addBookmark,
  removeBookmark,
  requestReviewWithOptions,
} from "@/services/rasn-naskah.services";
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconBulb,
  IconCheck,
  IconClipboard,
  IconCopy,
  IconDownload,
  IconFile,
  IconFileTypePdf,
  IconAlertTriangle,
  IconAlertCircle,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text, Paragraph } = Typography;

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
    label: "MINOR",
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
const IssueCard = ({ issue }) => {
  const config = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.minor;
  const Icon = config.icon;

  const handleCopy = () => {
    const textToCopy = issue.suggested_text || issue.suggestion || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      message.success("Teks disalin");
    }
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        background: config.bgColor,
        borderLeft: `3px solid ${config.borderColor}`,
        borderRadius: "4px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Space align="center" size={4} style={{ marginBottom: 6 }}>
            <Icon size={14} color={config.borderColor} />
            <Tag color={config.color} style={{ margin: 0, fontSize: 11 }}>
              {config.label}
            </Tag>
            {issue.is_resolved && (
              <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                <IconCheck size={10} /> Resolved
              </Tag>
            )}
          </Space>

          {issue.rule_reference && (
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
              {issue.rule_reference}
            </Text>
          )}

          {issue.description && (
            <Paragraph style={{ marginBottom: 6, fontSize: 13 }}>
              {issue.description}
            </Paragraph>
          )}

          {(issue.original_text || issue.suggested_text || issue.issue_text || issue.suggestion) && (
            <div
              style={{
                background: "#fff",
                padding: "8px 10px",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {(issue.original_text || issue.issue_text) && (
                <div style={{ marginBottom: 4 }}>
                  <Text delete type="secondary" style={{ fontFamily: "monospace" }}>
                    "{issue.original_text || issue.issue_text}"
                  </Text>
                </div>
              )}
              {(issue.original_text || issue.issue_text) && (issue.suggested_text || issue.suggestion) && (
                <div style={{ color: "#999", fontSize: 11 }}>↓</div>
              )}
              {(issue.suggested_text || issue.suggestion) && (
                <Text strong style={{ color: "#52c41a", fontFamily: "monospace" }}>
                  "{issue.suggested_text || issue.suggestion}"
                </Text>
              )}
            </div>
          )}
        </div>

        {(issue.suggested_text || issue.suggestion) && (
          <Tooltip title="Salin saran">
            <Button
              type="text"
              size="small"
              icon={<IconCopy size={14} />}
              onClick={handleCopy}
              style={{ marginLeft: 8 }}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};

// Target Style Feedback Component - supports both user preferences and superior preferences
const TargetStyleFeedback = ({ target, feedback }) => {
  if (!feedback) return null;

  // Get target name from various sources
  const targetName = feedback?.target_name || 
    target?.user_name || 
    target?.superior_name || 
    "Target";

  // Get language style description
  const getStyleDescription = (style) => {
    const descriptions = {
      formal_lengkap: "Formal Lengkap - Detail & Komprehensif",
      formal_ringkas: "Formal Ringkas - Langsung ke Pokok",
      semi_formal: "Semi-Formal - Fleksibel & Sopan",
      formal: "Formal Standar",
      standar: "Standar Pergub",
      ringkas: "Ringkas & To The Point",
    };
    return descriptions[style] || style;
  };

  const styleRequested = feedback?.style_requested || target?.language_style;
  const complianceScore = feedback?.compliance_score;
  const styleAnalysis = feedback?.style_analysis;

  return (
    <Card
      size="small"
      style={{
        marginTop: 12,
        background: feedback.is_compliant ? "#f6ffed" : "#fffbe6",
        borderColor: feedback.is_compliant ? "#b7eb8f" : "#ffe58f",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Space align="center">
          <IconUser size={14} color={feedback.is_compliant ? "#52c41a" : "#faad14"} />
          <Text strong style={{ fontSize: 12 }}>
            ANALISIS GAYA BAHASA - {targetName}
          </Text>
        </Space>
        <Space>
          {complianceScore !== undefined && (
            <Tag color={complianceScore >= 80 ? "success" : complianceScore >= 60 ? "warning" : "error"}>
              Kesesuaian: {complianceScore}%
            </Tag>
          )}
          {feedback.is_compliant && (
            <Tag color="success" style={{ fontSize: 10 }}>✓ Sesuai</Tag>
          )}
        </Space>
      </div>

      {/* Style Requested */}
      {styleRequested && (
        <div style={{ marginBottom: 10, padding: "6px 10px", background: "#fff", borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Gaya yang diminta: </Text>
          <Tag color="blue" style={{ fontSize: 11 }}>{getStyleDescription(styleRequested)}</Tag>
        </div>
      )}

      {/* Custom Rules Check */}
      {feedback.custom_rules_check?.length > 0 && (
        <div style={{ marginBottom: 10, padding: 8, background: "#fff7e6", borderRadius: 4, border: "1px solid #ffd591" }}>
          <Text strong style={{ fontSize: 11, display: "block", marginBottom: 6 }}>📋 Status Aturan Khusus:</Text>
          {feedback.custom_rules_check.map((rule, idx) => (
            <div key={idx} style={{ 
              marginBottom: 6, 
              padding: 6, 
              background: rule.status === "terpenuhi" ? "#f6ffed" : rule.status === "sebagian" ? "#fffbe6" : "#fff1f0",
              borderRadius: 4,
              borderLeft: `3px solid ${rule.status === "terpenuhi" ? "#52c41a" : rule.status === "sebagian" ? "#faad14" : "#ff4d4f"}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 11 }}>
                  {rule.status === "terpenuhi" ? "✅" : rule.status === "sebagian" ? "⚠️" : "❌"} 
                  {" "}{rule.rule}
                </Text>
                <Tag 
                  color={rule.status === "terpenuhi" ? "success" : rule.status === "sebagian" ? "warning" : "error"} 
                  style={{ fontSize: 9 }}
                >
                  {rule.status === "terpenuhi" ? "Terpenuhi" : rule.status === "sebagian" ? "Sebagian" : "Tidak Terpenuhi"}
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 10, display: "block" }}>{rule.detail}</Text>
              {rule.found_in_document && (
                <Text style={{ fontSize: 10, color: "#52c41a", display: "block", marginTop: 2 }}>
                  📍 Ditemukan: "{rule.found_in_document}"
                </Text>
              )}
              {rule.missing_element && (
                <Text style={{ fontSize: 10, color: "#ff4d4f", display: "block", marginTop: 2 }}>
                  ⚠️ Kurang: {rule.missing_element}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Forbidden Words Found */}
      {feedback.forbidden_words_found?.length > 0 && (
        <div style={{ marginBottom: 10, padding: 8, background: "#fff1f0", borderRadius: 4, border: "1px solid #ffa39e" }}>
          <Text strong style={{ fontSize: 11, display: "block", marginBottom: 6 }}>🚫 Kata Terlarang Ditemukan:</Text>
          {feedback.forbidden_words_found.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 4, padding: 4, background: "#fff", borderRadius: 4 }}>
              <Tag color="red" style={{ fontSize: 10 }}>"{item.word}"</Tag>
              <Text style={{ fontSize: 10 }}> → ganti dengan </Text>
              <Tag color="green" style={{ fontSize: 10 }}>"{item.replacement}"</Tag>
              {item.location && (
                <Text type="secondary" style={{ fontSize: 9, display: "block", marginTop: 2 }}>
                  Konteks: {item.location}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Terms to Replace */}
      {feedback.terms_to_replace?.length > 0 && (
        <div style={{ marginBottom: 10, padding: 8, background: "#e6f7ff", borderRadius: 4, border: "1px solid #91d5ff" }}>
          <Text strong style={{ fontSize: 11, display: "block", marginBottom: 6 }}>🔄 Istilah yang Harus Diganti:</Text>
          {feedback.terms_to_replace.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 4, padding: 4, background: "#fff", borderRadius: 4 }}>
              <Tag color="orange" style={{ fontSize: 10 }}>"{item.original}"</Tag>
              <Text style={{ fontSize: 10 }}> → </Text>
              <Tag color="blue" style={{ fontSize: 10 }}>"{item.preferred}"</Tag>
              {item.location && (
                <Text type="secondary" style={{ fontSize: 9, display: "block", marginTop: 2 }}>
                  Konteks: {item.location}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Style Analysis */}
      {styleAnalysis && (
        <div style={{ marginBottom: 10, padding: 8, background: "#fafafa", borderRadius: 4 }}>
          <Text strong style={{ fontSize: 11, display: "block", marginBottom: 6 }}>📊 Analisis Gaya:</Text>
          <Row gutter={[8, 4]}>
            {styleAnalysis.sentence_length && (
              <Col span={12}>
                <Text style={{ fontSize: 10 }}>📏 Panjang Kalimat: </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>{styleAnalysis.sentence_length}</Text>
              </Col>
            )}
            {styleAnalysis.formality_level && (
              <Col span={12}>
                <Text style={{ fontSize: 10 }}>🎩 Formalitas: </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>{styleAnalysis.formality_level}</Text>
              </Col>
            )}
            {styleAnalysis.word_choice && (
              <Col span={12}>
                <Text style={{ fontSize: 10 }}>📝 Pilihan Kata: </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>{styleAnalysis.word_choice}</Text>
              </Col>
            )}
            {styleAnalysis.overall_tone && (
              <Col span={12}>
                <Text style={{ fontSize: 10 }}>🎯 Nada: </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>{styleAnalysis.overall_tone}</Text>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* Suggestions with before/after */}
      {feedback.suggestions?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <Text strong style={{ fontSize: 11, display: "block", marginBottom: 6 }}>💡 Saran Penyesuaian Gaya:</Text>
          {feedback.suggestions.map((item, index) => (
            <div key={index} style={{ 
              marginBottom: 8, 
              padding: 8, 
              background: "#fff", 
              borderRadius: 4,
              border: "1px solid #f0f0f0"
            }}>
              <Text strong style={{ fontSize: 11, color: "#fa8c16" }}>{item.issue}</Text>
              
              {/* Show original and suggested sentences if available */}
              {item.original_sentence && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ marginBottom: 4 }}>
                    <Tag color="red" style={{ fontSize: 9 }}>SEBELUM</Tag>
                    <Text delete style={{ fontSize: 11, color: "#999" }}> {item.original_sentence}</Text>
                  </div>
                  {item.suggested_sentence && (
                    <div>
                      <Tag color="green" style={{ fontSize: 9 }}>SESUDAH</Tag>
                      <Text style={{ fontSize: 11, color: "#52c41a" }}> {item.suggested_sentence}</Text>
                    </div>
                  )}
                </div>
              )}
              
              {item.suggestion && (
                <Text type="secondary" style={{ fontSize: 10, display: "block", marginTop: 4 }}>
                  ℹ️ {item.suggestion}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Overall Note */}
      {feedback.overall_note && (
        <div style={{ padding: 8, background: "#fff", borderRadius: 4, borderLeft: "3px solid #52c41a" }}>
          <IconCheck size={12} color="#52c41a" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 11 }}>{feedback.overall_note}</Text>
        </div>
      )}
    </Card>
  );
};

// File Viewer Component - supports PDF, DOCX, images
const FileViewer = ({ url, fileType, fileName }) => {
  if (!url) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        borderRadius: 8,
      }}>
        <Empty description="Tidak ada file" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  // Get file extension from URL or fileType
  const getFileExtension = () => {
    if (fileType) {
      if (fileType.includes("pdf")) return "pdf";
      if (fileType.includes("word") || fileType.includes("document")) return "docx";
      if (fileType.includes("image")) return "image";
      if (fileType.includes("sheet") || fileType.includes("excel")) return "xlsx";
    }
    const ext = url.split(".").pop()?.toLowerCase()?.split("?")[0];
    return ext || "unknown";
  };

  const extension = getFileExtension();

  // PDF - use iframe embed
  if (extension === "pdf") {
    return (
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 8,
        }}
        title="PDF Preview"
      />
    );
  }

  // Images - display directly
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension) || extension === "image") {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        borderRadius: 8,
        overflow: "auto",
        padding: 16,
      }}>
        <img
          src={url}
          alt={fileName || "Document"}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 4,
          }}
        />
      </div>
    );
  }

  // DOCX, XLSX, PPTX - use Google Docs Viewer or Office Online
  if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(extension)) {
    // Try Microsoft Office Online viewer first (works better for Office files)
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    // Fallback: Google Docs Viewer
    // const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <iframe
          src={officeViewerUrl}
          style={{
            width: "100%",
            flex: 1,
            border: "none",
            borderRadius: 8,
          }}
          title="Document Preview"
        />
        <div style={{
          padding: "8px 12px",
          background: "#fafafa",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Preview menggunakan Microsoft Office Online
          </Text>
          <Button
            size="small"
            type="link"
            icon={<IconDownload size={14} />}
            onClick={() => window.open(url, "_blank")}
          >
            Download
          </Button>
        </div>
      </div>
    );
  }

  // Unknown file type - show download option
  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      borderRadius: 8,
      padding: 24,
    }}>
      <IconFile size={48} color="#bfbfbf" />
      <Text type="secondary" style={{ marginTop: 12, marginBottom: 16 }}>
        Preview tidak tersedia untuk tipe file ini
      </Text>
      <Button
        icon={<IconDownload size={14} />}
        onClick={() => window.open(url, "_blank")}
      >
        Download File
      </Button>
    </div>
  );
};

const RasnNaskahDocumentDetail = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const queryClient = useQueryClient();
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [activeTab, setActiveTab] = useState("content");

  const { data: doc, isLoading, refetch } = useRasnNaskahDocumentDetail(documentId);
  const { data: reviewData, isLoading: reviewLoading } = useRasnNaskahDocumentReview(documentId);
  const { data: usersWithPrefs, isLoading: usersLoading, error: usersError } = useRasnNaskahUsersWithPreferences();

  // Debug logging
  useEffect(() => {
    console.log("[DOCUMENT DETAIL] Users with prefs:", usersWithPrefs);
    console.log("[DOCUMENT DETAIL] Users loading:", usersLoading);
    console.log("[DOCUMENT DETAIL] Users error:", usersError);
  }, [usersWithPrefs, usersLoading, usersError]);

  // Poll for updates when content is being formatted
  useEffect(() => {
    let interval = null;
    if (doc?.content_status === "formatting") {
      interval = setInterval(() => {
        refetch();
      }, 3000); // Poll every 3 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [doc?.content_status, refetch]);

  // Get the latest completed review
  const review = useMemo(() => {
    if (Array.isArray(reviewData)) {
      return reviewData.find((r) => r.status === "completed");
    }
    return reviewData?.status === "completed" ? reviewData : null;
  }, [reviewData]);

  const issues = review?.issues || [];

  // Group issues for display
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

  const bookmarkMutation = useMutation({
    mutationFn: () =>
      doc?.is_bookmarked ? removeBookmark(documentId) : addBookmark(documentId),
    onSuccess: () => {
      message.success(doc?.is_bookmarked ? "Bookmark dihapus" : "Dokumen ditandai");
      queryClient.invalidateQueries(["rasn-naskah-document", documentId]);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      // Use requestReviewWithOptions if target user is selected
      if (selectedTargetUser) {
        return requestReviewWithOptions(documentId, {
          targetUserId: selectedTargetUser,
        });
      }
      return startReview(documentId);
    },
    onSuccess: () => {
      message.success("Review dimulai");
      queryClient.invalidateQueries(["rasn-naskah-document", documentId]);
      queryClient.invalidateQueries(["rasn-naskah-review", documentId]);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      message.error(errorData?.message || "Gagal memulai review");
    },
  });

  const handleCopyAll = () => {
    const allSuggestions = issues
      .filter((i) => i.suggested_text || i.suggestion)
      .map((i) => `${i.original_text || i.issue_text || ""} → ${i.suggested_text || i.suggestion}`)
      .join("\n\n");

    if (allSuggestions) {
      navigator.clipboard.writeText(allSuggestions);
      message.success("Semua saran disalin");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      pending_review: "processing",
      reviewing: "warning",
      reviewed: "success",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Draf",
      pending_review: "Menunggu Review",
      reviewing: "Sedang Direview",
      reviewed: "Sudah Direview",
    };
    return labels[status] || status;
  };

  const pendingReview = doc?.reviews?.find((r) => ["pending", "processing"].includes(r.status));

  return (
    <>
      <Head>
        <title>SAKTI Naskah - {doc?.title || "Dokumen"}</title>
      </Head>
      <PageContainer
        title={null}
        header={{ style: { display: "none" } }}
      >
        <Spin spinning={isLoading || reviewLoading}>
          {/* Compact Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              padding: "12px 16px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
          >
            <Space>
              <Button
                type="text"
                icon={<IconArrowLeft size={16} />}
                onClick={() => router.push("/rasn-naskah")}
              />
              <div>
                <Space align="center">
                  <IconFile size={18} />
                  <Text strong>{doc?.title || "Dokumen"}</Text>
                  <Tag color={getStatusColor(doc?.status)} style={{ marginLeft: 8 }}>
                    {getStatusLabel(doc?.status)}
                  </Tag>
                </Space>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {doc?.document_number || "-"} • {dayjs(doc?.created_at).format("DD MMM YYYY")}
                  </Text>
                </div>
              </div>
            </Space>

            <Space>
              {review && (
                <div style={{ textAlign: "right", marginRight: 16 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Skor</Text>
                  <div>
                    <Badge
                      count={`${review.score || 0}/100`}
                      style={{
                        backgroundColor: getScoreColor(review.score || 0),
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Target User Selector */}
              <div style={{ minWidth: 200 }}>
                <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
                  Tujuan:
                </Text>
                <Select
                  size="small"
                  placeholder="Tanpa preferensi"
                  allowClear
                  value={selectedTargetUser}
                  onChange={setSelectedTargetUser}
                  style={{ width: "100%" }}
                  optionLabelProp="label"
                >
                  <Select.Option value={null} label="Tanpa preferensi">
                    <Text style={{ fontSize: 12 }}>Tanpa preferensi</Text>
                  </Select.Option>
                  {usersWithPrefs?.map((user) => (
                    <Select.Option
                      key={user.id}
                      value={user.user_id}
                      label={user.user_name}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <IconUser size={14} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>
                            {user.user_name}
                          </div>
                          <div style={{ fontSize: 11, color: "#999" }}>
                            {user.language_style === "formal_lengkap" && "Formal lengkap"}
                            {user.language_style === "formal_ringkas" && "Ringkas"}
                            {user.language_style === "semi_formal" && "Semi-formal"}
                            {user.language_style === "formal" && "Formal"}
                            {user.language_style === "standar" && "Standar"}
                          </div>
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <Button
                icon={doc?.is_bookmarked ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
                onClick={() => bookmarkMutation.mutate()}
                loading={bookmarkMutation.isLoading}
              />
              {pendingReview ? (
                <Button loading>Sedang Review...</Button>
              ) : (
                <Button
                  type="primary"
                  icon={<IconClipboard size={16} />}
                  onClick={() => reviewMutation.mutate()}
                  loading={reviewMutation.isLoading}
                >
                  Review AI
                </Button>
              )}
            </Space>
          </div>

          {/* Main Content */}
          <Row gutter={16}>
            {/* Left: Document View */}
            <Col xs={24} lg={14}>
              <Card
                size="small"
                style={{ height: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}
                bodyStyle={{ flex: 1, overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  size="small"
                  style={{ padding: "0 12px" }}
                  items={[
                    {
                      key: "content",
                      label: (
                        <Space size={4}>
                          <IconFile size={14} />
                          Konten
                        </Space>
                      ),
                    },
                    {
                      key: "file",
                      label: (
                        <Space size={4}>
                          <IconFileTypePdf size={14} />
                          File Asli
                        </Space>
                      ),
                    },
                  ]}
                />
                <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                  {activeTab === "content" ? (
                    <div
                      style={{
                        background: "#fafafa",
                        padding: 16,
                        borderRadius: 8,
                        minHeight: "100%",
                      }}
                    >
                      {doc?.content_status === "formatting" ? (
                        <div style={{ textAlign: "center", padding: 40 }}>
                          <Spin />
                          <div style={{ marginTop: 16 }}>
                            <Text type="secondary">Memformat konten dengan AI...</Text>
                          </div>
                        </div>
                      ) : doc?.content ? (
                        <ReactMarkdownCustom>
                          {doc.content}
                        </ReactMarkdownCustom>
                      ) : (
                        <Empty description="Tidak ada konten" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  ) : (
                    <div style={{ height: "100%", minHeight: 500 }}>
                      <FileViewer
                        url={doc?.original_file_url}
                        fileType={doc?.original_file_type}
                        fileName={doc?.original_file_name}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* Right: Review Results */}
            <Col xs={24} lg={10}>
              <Card
                size="small"
                style={{ height: "calc(100vh - 200px)", overflow: "auto" }}
                bodyStyle={{ padding: 12 }}
              >
                {!review ? (
                  <Empty
                    description={
                      <div>
                        <Text>Belum ada hasil review</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Klik "Review AI" untuk memulai
                        </Text>
                      </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ marginTop: 40 }}
                  />
                ) : (
                  <>
                    {/* AI Summary */}
                    {review.ai_summary && (
                      <div
                        style={{
                          padding: 12,
                          background: "#fffbe6",
                          borderRadius: 6,
                          marginBottom: 12,
                          borderLeft: "3px solid #ffe58f",
                        }}
                      >
                        <Space align="start">
                          <IconBulb size={14} color="#faad14" style={{ marginTop: 2 }} />
                          <div>
                            <Text strong style={{ color: "#d48806", fontSize: 11, display: "block" }}>
                              RINGKASAN AI
                            </Text>
                            <Text style={{ fontSize: 13 }}>{review.ai_summary}</Text>
                          </div>
                        </Space>
                      </div>
                    )}

                    {/* Issues Count */}
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 12 }}>
                        TEMUAN ({issues.length})
                      </Text>
                      <Space size={4} style={{ marginLeft: 12 }}>
                        {groupedIssues.format.length > 0 && (
                          <Tag color="red" style={{ fontSize: 10 }}>Format: {groupedIssues.format.length}</Tag>
                        )}
                        {groupedIssues.penulisan.length > 0 && (
                          <Tag color="orange" style={{ fontSize: 10 }}>Penulisan: {groupedIssues.penulisan.length}</Tag>
                        )}
                        {groupedIssues.saran.length > 0 && (
                          <Tag color="blue" style={{ fontSize: 10 }}>Saran: {groupedIssues.saran.length}</Tag>
                        )}
                      </Space>
                    </div>

                    {/* Grouped Issues */}
                    <div style={{ maxHeight: "calc(100vh - 500px)", overflow: "auto" }}>
                      {groupedIssues.format.map((issue) => (
                        <IssueCard key={issue.id} issue={{ ...issue, severity: "critical" }} />
                      ))}

                      {groupedIssues.penulisan.map((issue) => (
                        <IssueCard key={issue.id} issue={{ ...issue, severity: issue.severity || "major" }} />
                      ))}

                      {groupedIssues.saran.map((issue) => (
                        <IssueCard key={issue.id} issue={{ ...issue, severity: "suggestion" }} />
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

                    {/* Target Style Feedback - shows feedback based on target user preferences */}
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
                      {doc?.original_file_url && (
                        <Button
                          size="small"
                          icon={<IconDownload size={14} />}
                          onClick={() => window.open(doc.original_file_url, "_blank")}
                        >
                          Download
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<IconRefresh size={14} />}
                        onClick={() => reviewMutation.mutate()}
                        loading={reviewMutation.isLoading}
                      >
                        Review Ulang
                      </Button>
                    </Space>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </Spin>
      </PageContainer>
    </>
  );
};

RasnNaskahDocumentDetail.getLayout = function getLayout(page) {
  return <LayoutRasnNaskah active="/rasn-naskah">{page}</LayoutRasnNaskah>;
};

RasnNaskahDocumentDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahDocumentDetail;
