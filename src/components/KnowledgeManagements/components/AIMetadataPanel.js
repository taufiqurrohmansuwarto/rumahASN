import {
  BarChartOutlined,
  BarsOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  HeartOutlined,
  LinkOutlined,
  RobotOutlined,
  StarOutlined,
  TagsOutlined,
  AimOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Collapse,
  Divider,
  Flex,
  Grid,
  List,
  Progress,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { useState } from "react";

const { Text, Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const AIMetadataPanel = ({ data, className, ...props }) => {
  const [activeKeys, setActiveKeys] = useState(["insights"]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!data) {
    return null;
  }

  // Parse JSON fields safely
  const parseJsonField = (field) => {
    try {
      return typeof field === "string" ? JSON.parse(field) : field || [];
    } catch {
      return [];
    }
  };

  const keywords = parseJsonField(data.ai_keywords);
  const tags = parseJsonField(data.ai_tags);
  const relatedContent = parseJsonField(data.ai_related_content);
  const suggestions = parseJsonField(data.ai_suggestions);
  const seoKeywords = parseJsonField(data.ai_seo_keywords);

  // Score color helpers
  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  const getReadabilityLevel = (score) => {
    if (score >= 80) return "Sangat Mudah";
    if (score >= 60) return "Mudah";
    if (score >= 40) return "Sedang";
    return "Sulit";
  };

  const getSentimentLabel = (score) => {
    const numScore = parseFloat(score);
    if (numScore > 0.3) return { label: "Positif", color: "green" };
    if (numScore < -0.3) return { label: "Negatif", color: "red" };
    return { label: "Netral", color: "gray" };
  };

  // Check if any data exists to show the panel
  const hasAnyData =
    data.ai_summary ||
    keywords.length > 0 ||
    tags.length > 0 ||
    relatedContent.length > 0 ||
    (data.ai_readability_score !== null &&
      data.ai_readability_score !== undefined) ||
    data.ai_quality_score ||
    data.ai_completeness_score ||
    suggestions.length > 0 ||
    (data.ai_suggested_category &&
      data.ai_suggested_category !== null &&
      data.ai_suggested_category !== "null") ||
    seoKeywords.length > 0 ||
    data.ai_meta_description ||
    (data.ai_sentiment_score !== null &&
      data.ai_sentiment_score !== undefined) ||
    (data.ai_confidence_score && parseFloat(data.ai_confidence_score) > 0) ||
    data.processing_status;

  if (!hasAnyData) {
    return null;
  }

  // For sentiment analysis in technical section
  const sentiment = getSentimentLabel(data.ai_sentiment_score || 0);

  return (
    <Flex>
      {/* Content Section */}
      <div
        style={{ flex: 1, padding: "16px", marginTop: 32 }}
        className={className}
        {...props}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: isMobile ? 16 : 20,
            borderBottom: "2px solid #f5f5f5",
            paddingBottom: isMobile ? 12 : 16,
          }}
        >
          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              color: "#262626",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RobotOutlined /> Metadata AI
          </Title>
          <Text
            type="secondary"
            italic
            style={{
              fontSize: isMobile ? 12 : 13,
              marginTop: 4,
              display: "block",
            }}
          >
            Informasi dan analisis konten yang dihasilkan secara otomatis
            menggunakan kecerdasan buatan untuk membantu meningkatkan kualitas
            dan pemahaman konten.
          </Text>
        </div>

        <div style={{ marginBottom: 16 }}>
          {/* AI Summary - Only show if exists */}
          {data.ai_summary && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <BarsOutlined style={{ color: "#FF4500", fontSize: 16 }} />
                <Text strong type="secondary" style={{ fontSize: 14 }}>
                  AI Ringkasan
                </Text>
              </div>
              <Text italic style={{ fontSize: 14, lineHeight: 1.5 }}>
                &ldquo;{data.ai_summary}&rdquo;
              </Text>
            </div>
          )}

          {/* Keywords & Tags - Only show if exists */}
          {(keywords.length > 0 || tags.length > 0) && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <TagsOutlined style={{ color: "#FF4500", fontSize: 16 }} />
                <Text strong type="secondary" style={{ fontSize: 14 }}>
                  Topik Terkait
                </Text>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {keywords.slice(0, 6).map((keyword, idx) => (
                  <Tag key={idx} color="blue" style={{ fontSize: 12 }}>
                    {keyword}
                  </Tag>
                ))}
                {tags.slice(0, 4).map((tag, idx) => (
                  <Tag
                    key={`tag-${idx}`}
                    color="orange"
                    style={{ fontSize: 12 }}
                  >
                    #{tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Related Content - Only show if exists */}
          {relatedContent.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <LinkOutlined style={{ color: "#FF4500", fontSize: 16 }} />
                <Text strong type="secondary" style={{ fontSize: 14 }}>
                  Artikel Terkait
                </Text>
              </div>
              <List
                size="small"
                dataSource={relatedContent.slice(0, 3)}
                renderItem={(content) => (
                  <List.Item>
                    <Typography.Link
                      href={content.url || "#"}
                      style={{ fontSize: 14 }}
                    >
                      {content.title || content}
                    </Typography.Link>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Reading Time Estimate - Only show if summary exists */}
          {data.ai_summary && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <ClockCircleOutlined style={{ color: "#FF4500", fontSize: 16 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Estimasi baca:{" "}
                {Math.ceil(data.ai_summary.split(" ").length / 200)} menit
              </Text>
            </div>
          )}

          <Divider />

          {/* Content Quality Metrics - Only show if any scores exist */}
          {(data.ai_quality_score ||
            (data.ai_readability_score !== null &&
              data.ai_readability_score !== undefined) ||
            data.ai_completeness_score ||
            (data.ai_suggested_category &&
              data.ai_suggested_category !== null &&
              data.ai_suggested_category !== "null")) && (
            <Collapse
              activeKey={activeKeys}
              onChange={setActiveKeys}
              ghost
              style={{ marginBottom: 16 }}
            >
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <BarChartOutlined
                      style={{ color: "#FF4500", fontSize: 18 }}
                    />
                    <Text strong>Analisis Konten</Text>
                  </div>
                }
                key="insights"
              >
                <div style={{ marginBottom: 16 }}>
                  {/* Quality Scores - Compact Layout */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {data.ai_quality_score && (
                      <div style={{ flex: 1, padding: "8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <StarOutlined style={{ color: getScoreColor(data.ai_quality_score), fontSize: 14 }} />
                          <Text strong style={{ fontSize: 18 }}>{data.ai_quality_score}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>Kualitas</Text>
                        <Progress
                          percent={data.ai_quality_score}
                          strokeColor={getScoreColor(data.ai_quality_score) === "green" ? "#52c41a" : getScoreColor(data.ai_quality_score) === "yellow" ? "#fadb14" : "#ff4d4f"}
                          size="small"
                          showInfo={false}
                          style={{ marginTop: 2 }}
                        />
                      </div>
                    )}

                    {data.ai_readability_score !== null && data.ai_readability_score !== undefined && (
                      <div style={{ flex: 1, padding: "8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <EyeOutlined style={{ color: getScoreColor(data.ai_readability_score), fontSize: 14 }} />
                          <Text strong style={{ fontSize: 18 }}>{data.ai_readability_score}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>{getReadabilityLevel(data.ai_readability_score)}</Text>
                        <Progress
                          percent={data.ai_readability_score}
                          strokeColor={getScoreColor(data.ai_readability_score) === "green" ? "#52c41a" : getScoreColor(data.ai_readability_score) === "yellow" ? "#fadb14" : "#ff4d4f"}
                          size="small"
                          showInfo={false}
                          style={{ marginTop: 2 }}
                        />
                      </div>
                    )}

                    {data.ai_completeness_score && (
                      <div style={{ flex: 1, padding: "8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <AimOutlined style={{ color: getScoreColor(data.ai_completeness_score), fontSize: 14 }} />
                          <Text strong style={{ fontSize: 18 }}>{data.ai_completeness_score}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>Kelengkapan</Text>
                        <Progress
                          percent={data.ai_completeness_score}
                          strokeColor={getScoreColor(data.ai_completeness_score) === "green" ? "#52c41a" : getScoreColor(data.ai_completeness_score) === "yellow" ? "#fadb14" : "#ff4d4f"}
                          size="small"
                          showInfo={false}
                          style={{ marginTop: 2 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Category Suggestion - Only show if exists and not null */}
                  {data.ai_suggested_category &&
                    data.ai_suggested_category !== null &&
                    data.ai_suggested_category !== "null" && (
                      <Alert
                        icon={<BulbOutlined />}
                        type="info"
                        showIcon
                        message={
                          <Text style={{ fontSize: 14 }}>
                            <strong>Saran Kategori:</strong>{" "}
                            {data.ai_suggested_category}
                            {data.ai_confidence_score &&
                              parseFloat(data.ai_confidence_score) > 0 && (
                                <Text type="secondary">
                                  {" "}
                                  (Kepercayaan:{" "}
                                  {Math.round(
                                    parseFloat(data.ai_confidence_score) * 100
                                  )}
                                  %)
                                </Text>
                              )}
                          </Text>
                        }
                      />
                    )}
                </div>
              </Panel>
            </Collapse>
          )}

          {/* Content Suggestions - Only show if exists */}
          {suggestions.length > 0 && (
            <Collapse ghost style={{ marginBottom: 16 }}>
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ThunderboltOutlined
                      style={{ color: "#FF4500", fontSize: 18 }}
                    />
                    <Text strong>Saran Perbaikan</Text>
                    <Tag color="orange" size="small">
                      {suggestions.length}
                    </Tag>
                  </div>
                }
                key="suggestions"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "6px 8px",
                        backgroundColor: "#fafafa",
                        borderRadius: "4px",
                        borderLeft: "3px solid #faad14"
                      }}
                    >
                      <BulbOutlined style={{ color: "#faad14", fontSize: 12, marginTop: 2 }} />
                      <Text style={{ fontSize: 13, lineHeight: 1.4 }}>{suggestion}</Text>
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          )}

          {/* SEO Info - Only show if exists */}
          {(seoKeywords.length > 0 || data.ai_meta_description) && (
            <Alert
              icon={<TrophyOutlined />}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
              message={
                <div>
                  <Text
                    strong
                    style={{ fontSize: 14, marginBottom: 8, display: "block" }}
                  >
                    Optimisasi SEO
                  </Text>
                  {data.ai_meta_description && (
                    <Text
                      style={{
                        fontSize: 12,
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      <strong>Deskripsi Meta:</strong>{" "}
                      {data.ai_meta_description}
                    </Text>
                  )}
                  {seoKeywords.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 500 }}>
                        Kata Kunci:
                      </Text>
                      {seoKeywords.slice(0, 5).map((keyword, idx) => (
                        <Tag key={idx} color="green" size="small">
                          {keyword}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              }
            />
          )}

          <Divider />

          {/* Technical Information - Only show if any technical data exists */}
          {(data.processing_status ||
            (data.ai_sentiment_score !== null &&
              data.ai_sentiment_score !== undefined) ||
            (data.ai_confidence_score &&
              parseFloat(data.ai_confidence_score) > 0) ||
            data.error_message ||
            data.model_version ||
            data.last_processed) && (
            <Collapse ghost style={{ marginBottom: 16 }}>
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <RobotOutlined style={{ color: "#FF4500", fontSize: 18 }} />
                    <Text strong>Detail Teknis</Text>
                  </div>
                }
                key="technical"
              >
                <Timeline>
                  {/* Processing Status - Only show if exists */}
                  {data.processing_status && (
                    <Timeline.Item dot={<RobotOutlined />}>
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Status Pemrosesan
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Tag
                          color={
                            data.processing_status === "completed"
                              ? "green"
                              : "orange"
                          }
                        >
                          {data.processing_status || "unknown"}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Model: {data.model_version || "Tidak Ada"}
                        </Text>
                      </div>
                      {data.last_processed && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Diproses:{" "}
                          {new Date(data.last_processed).toLocaleString(
                            "id-ID"
                          )}
                        </Text>
                      )}
                    </Timeline.Item>
                  )}

                  {/* Sentiment Analysis - Only show if exists */}
                  {data.ai_sentiment_score !== null &&
                    data.ai_sentiment_score !== undefined && (
                      <Timeline.Item dot={<HeartOutlined />}>
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            marginBottom: 8,
                            display: "block",
                          }}
                        >
                          Analisis Sentimen
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Tag color={sentiment.color}>{sentiment.label}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Skor: {Number(data.ai_sentiment_score).toFixed(2)}
                          </Text>
                        </div>
                      </Timeline.Item>
                    )}

                  {/* Confidence Score - Only show if exists and greater than 0 */}
                  {data.ai_confidence_score &&
                    parseFloat(data.ai_confidence_score) > 0 && (
                      <Timeline.Item dot={<TargetOutlined />}>
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            marginBottom: 8,
                            display: "block",
                          }}
                        >
                          Kepercayaan AI
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Progress
                            percent={parseFloat(data.ai_confidence_score) * 100}
                            strokeColor={{
                              "0%":
                                getScoreColor(
                                  parseFloat(data.ai_confidence_score) * 100
                                ) === "green"
                                  ? "#52c41a"
                                  : getScoreColor(
                                      parseFloat(data.ai_confidence_score) * 100
                                    ) === "yellow"
                                  ? "#fadb14"
                                  : "#ff4d4f",
                              "100%":
                                getScoreColor(
                                  parseFloat(data.ai_confidence_score) * 100
                                ) === "green"
                                  ? "#52c41a"
                                  : getScoreColor(
                                      parseFloat(data.ai_confidence_score) * 100
                                    ) === "yellow"
                                  ? "#fadb14"
                                  : "#ff4d4f",
                            }}
                            style={{ width: 200 }}
                          />
                          <Text strong style={{ fontSize: 14 }}>
                            {Math.round(
                              parseFloat(data.ai_confidence_score) * 100
                            )}
                            %
                          </Text>
                        </div>
                      </Timeline.Item>
                    )}

                  {/* Error Messages - Only show if exists */}
                  {data.error_message && (
                    <Timeline.Item
                      dot={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Log Kesalahan
                      </Text>
                      <Alert
                        type="error"
                        showIcon={false}
                        message={data.error_message}
                        size="small"
                      />
                    </Timeline.Item>
                  )}
                </Timeline>
              </Panel>
            </Collapse>
          )}
        </div>
      </div>
    </Flex>
  );
};

export default AIMetadataPanel;
