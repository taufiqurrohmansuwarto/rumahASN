import {
  AppstoreOutlined,
  BarChartOutlined,
  BarsOutlined,
  BookOutlined,
  BlockOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  HeartOutlined,
  LineChartOutlined,
  LinkOutlined,
  RobotOutlined,
  SearchOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Collapse,
  Divider,
  Flex,
  Grid,
  List,
  Progress,
  Space,
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
  const missingElements = parseJsonField(data.ai_missing_elements);
  const improvementPriorityRaw = parseJsonField(data.ai_improvement_priority);
  const contentGaps = parseJsonField(data.ai_content_gaps);
  const semanticConcepts = parseJsonField(data.ai_semantic_concepts);
  const entityExtraction = parseJsonField(data.ai_entity_extraction);
  const topicClusters = parseJsonField(data.ai_topic_clusters);

  // Handle improvement priority - can be array of objects or strings
  const improvementPriority = Array.isArray(improvementPriorityRaw)
    ? improvementPriorityRaw.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle object format: {area, priority, description}
          const priority = item.priority || 'Medium';
          const description = item.description || item.area || 'Tidak ada deskripsi';
          return `${priority}: ${description}`;
        }
        // Handle string format
        return item;
      })
    : [];

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

  const getComplexityLevel = (score) => {
    if (score <= 3) return "Sederhana";
    if (score <= 6) return "Menengah";
    if (score <= 8) return "Kompleks";
    return "Sangat Kompleks";
  };

  const getLifecycleColor = (stage) => {
    const colors = {
      Draft: "orange",
      Active: "green",
      Mature: "blue",
      Outdated: "red",
      Legacy: "purple",
      Archive: "gray"
    };
    return colors[stage] || "default";
  };

  // Get icon and color based on score - more compact than progress bars
  const getScoreIcon = (score) => {
    if (score >= 80) return { icon: "🟢", color: "#52c41a", text: "Bagus" };
    if (score >= 60) return { icon: "🟡", color: "#fadb14", text: "Sedang" };
    return { icon: "🔴", color: "#ff4d4f", text: "Perlu Perbaikan" };
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

        <div style={{ marginBottom: 12 }}>
          {/* AI Summary - Only show if exists */}
          {data.ai_summary && (
            <div style={{
              marginBottom: 16,
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              borderLeft: '4px solid #FF4500'
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <BarsOutlined style={{ color: "#FF4500", fontSize: 16 }} />
                <Text strong style={{ fontSize: 14, color: '#FF4500' }}>
                  📝 Ringkasan AI
                </Text>
              </div>
              <Text style={{ fontSize: 13, lineHeight: 1.6, color: '#444' }}>
                {data.ai_summary}
              </Text>
            </div>
          )}

          {/* Keywords & Tags - Only show if exists */}
          {(keywords.length > 0 || tags.length > 0) && (
            <div style={{ marginBottom: 12 }}>
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
            <div style={{ marginBottom: 12 }}>
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

          {/* Basic Info Section - Clear & Separated */}
          <div style={{ marginBottom: 16 }}>
            {/* Reading Time & Audience - Primary Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
              {(data.ai_estimated_read_time || data.ai_summary) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ClockCircleOutlined style={{ color: "#FF4500", fontSize: 14 }} />
                  <Text strong style={{ fontSize: 13, color: '#262626' }}>
                    {data.ai_estimated_read_time ? `${data.ai_estimated_read_time} menit baca` : `${Math.ceil(data.ai_summary.split(" ").length / 200)} menit baca`}
                  </Text>
                </div>
              )}
              {data.ai_target_audience && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <UserOutlined style={{ color: "#FF4500", fontSize: 14 }} />
                  <Text strong style={{ fontSize: 13, color: '#262626' }}>
                    Untuk {data.ai_target_audience.replace(/"/g, '')}
                  </Text>
                </div>
              )}
            </div>

            {/* Content Type & Attributes - Secondary Info */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.ai_content_type_detected && (
                <Tag color="blue" size="small" style={{ fontSize: 11, padding: '2px 8px', fontWeight: 500 }}>
                  📖 {data.ai_content_type_detected}
                </Tag>
              )}
              {data.ai_content_complexity && (
                <Tag color="orange" size="small" style={{ fontSize: 11, padding: '2px 8px', fontWeight: 500 }}>
                  🎯 {getComplexityLevel(data.ai_content_complexity)}
                </Tag>
              )}
              {data.ai_content_lifecycle_stage && (
                <Tag color={getLifecycleColor(data.ai_content_lifecycle_stage)} size="small" style={{ fontSize: 11, padding: '2px 8px', fontWeight: 500 }}>
                  📈 {data.ai_content_lifecycle_stage}
                </Tag>
              )}
            </div>
          </div>

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
              size="small"
              style={{ marginBottom: 12 }}
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
                <div style={{ marginBottom: 12 }}>
                  {/* Quality Scores - Compact dengan Icons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {data.ai_quality_score && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <Text style={{ fontSize: 16 }}>{getScoreIcon(data.ai_quality_score).icon}</Text>
                        <Text strong style={{ fontSize: 13 }}>{data.ai_quality_score}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Kualitas</Text>
                      </div>
                    )}

                    {data.ai_readability_score !== null && data.ai_readability_score !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <Text style={{ fontSize: 16 }}>{getScoreIcon(data.ai_readability_score).icon}</Text>
                        <Text strong style={{ fontSize: 13 }}>{data.ai_readability_score}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{getReadabilityLevel(data.ai_readability_score)}</Text>
                      </div>
                    )}

                    {data.ai_completeness_score && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <Text style={{ fontSize: 16 }}>{getScoreIcon(data.ai_completeness_score).icon}</Text>
                        <Text strong style={{ fontSize: 13 }}>{data.ai_completeness_score}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Kelengkapan</Text>
                      </div>
                    )}
                  </div>

                  {/* Additional Scores - Compact */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {data.ai_engagement_score && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <Text style={{ fontSize: 16 }}>🔥</Text>
                        <Text strong style={{ fontSize: 13 }}>{data.ai_engagement_score}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Engagement</Text>
                      </div>
                    )}

                    {data.ai_shareability_score && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <Text style={{ fontSize: 16 }}>📤</Text>
                        <Text strong style={{ fontSize: 13 }}>{data.ai_shareability_score}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Shareability</Text>
                      </div>
                    )}

                    {data.ai_bookmark_probability && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <Text style={{ fontSize: 16 }}>📑</Text>
                        <Text strong style={{ fontSize: 13 }}>{Math.round(data.ai_bookmark_probability * 100)}%</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Bookmark</Text>
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
            <Collapse ghost size="small" style={{ marginBottom: 12 }}>
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
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
                        borderLeft: "3px solid #faad14",
                      }}
                    >
                      <BulbOutlined
                        style={{ color: "#faad14", fontSize: 12, marginTop: 2 }}
                      />
                      <Text style={{ fontSize: 13, lineHeight: 1.4 }}>
                        {suggestion}
                      </Text>
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
              style={{ marginBottom: 12 }}
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

          {/* Missing Elements & Content Gaps - Only show if exists */}
          {((missingElements && missingElements.length > 0) ||
            (contentGaps && contentGaps.length > 0) ||
            (improvementPriority && improvementPriority.length > 0)) && (
            <Collapse ghost style={{ marginBottom: 12 }}>
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ExclamationCircleOutlined
                      style={{ color: "#FF4500", fontSize: 18 }}
                    />
                    <Text strong>Area Perbaikan</Text>
                  </div>
                }
                key="improvements"
              >
                {missingElements && missingElements.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                      <SearchOutlined style={{ marginRight: 4, color: "#ff7875" }} />Elemen Hilang
                    </Text>
                    <Space wrap size="small">
                      {missingElements.slice(0, 6).map((element, idx) => (
                        <Tag key={idx} color="red" size="small" style={{ fontSize: 10 }}>{element}</Tag>
                      ))}
                    </Space>
                  </div>
                )}

                {contentGaps && contentGaps.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                      <BlockOutlined style={{ marginRight: 4, color: "#fa8c16" }} />Gap Konten
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {contentGaps.slice(0, 3).map((gap, idx) => (
                        <div key={idx} style={{ padding: "4px 6px", backgroundColor: "#fff7e6", borderRadius: "3px", borderLeft: "2px solid #fa8c16" }}>
                          <Text style={{ fontSize: 11 }}>{gap}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {improvementPriority && improvementPriority.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                      <FlagOutlined style={{ marginRight: 4, color: "#1890ff" }} />Prioritas
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {improvementPriority.slice(0, 3).map((priority, idx) => (
                        <div key={idx} style={{ padding: "4px 6px", backgroundColor: "#e6f7ff", borderRadius: "3px", borderLeft: "2px solid #1890ff" }}>
                          <Text style={{ fontSize: 11 }}>{priority}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            </Collapse>
          )}

          {/* Semantic Analysis - Only show if exists */}
          {((semanticConcepts && semanticConcepts.length > 0) ||
            (entityExtraction && Object.keys(entityExtraction).length > 0) ||
            (topicClusters && topicClusters.length > 0)) && (
            <Collapse ghost style={{ marginBottom: 12 }}>
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <AppstoreOutlined style={{ color: "#FF4500", fontSize: 18 }} />
                    <Text strong>Analisis Semantik</Text>
                  </div>
                }
                key="semantic"
              >
                {semanticConcepts && semanticConcepts.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                      <BlockOutlined style={{ marginRight: 4, color: "#52c41a" }} />Konsep Semantik
                    </Text>
                    <Space wrap size="small">
                      {semanticConcepts.slice(0, 8).map((concept, idx) => (
                        <Tag key={idx} color="green" size="small" style={{ fontSize: 10 }}>{concept}</Tag>
                      ))}
                    </Space>
                  </div>
                )}

                {entityExtraction && Object.keys(entityExtraction).length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                      <SearchOutlined style={{ marginRight: 4, color: "#722ed1" }} />Entitas
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {Object.entries(entityExtraction).slice(0, 3).map(([type, entities], idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Text type="secondary" style={{ fontSize: 11, minWidth: "60px", textTransform: "capitalize" }}>{type}:</Text>
                          <Space wrap size="small">
                            {(Array.isArray(entities) ? entities.slice(0, 4) : [entities]).map((entity, entityIdx) => (
                              <Tag key={entityIdx} color="purple" size="small" style={{ fontSize: 10 }}>{entity}</Tag>
                            ))}
                          </Space>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {topicClusters && topicClusters.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                      <BlockOutlined style={{ marginRight: 4, color: "#fa541c" }} />Topik
                    </Text>
                    <Space wrap size="small">
                      {topicClusters.slice(0, 6).map((cluster, idx) => (
                        <Tag key={idx} color="volcano" size="small" style={{ fontSize: 10 }}>{cluster}</Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </Panel>
            </Collapse>
          )}

          {/* Advanced Quality Metrics - Only show if exists */}
          {(data.ai_freshness_score ||
            data.ai_update_needed_score ||
            data.ai_fact_accuracy_score ||
            data.ai_objectivity_score ||
            data.ai_evidence_quality) && (
            <Collapse ghost style={{ marginBottom: 12 }}>
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <LineChartOutlined style={{ color: "#FF4500", fontSize: 18 }} />
                    <Text strong>Metrik Kualitas Lanjutan</Text>
                  </div>
                }
                key="advanced-quality"
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {/* Advanced Quality Scores - Compact */}
                  {data.ai_freshness_score && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                      <Text style={{ fontSize: 16 }}>🔄</Text>
                      <Text strong style={{ fontSize: 13 }}>{data.ai_freshness_score}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>Kesegaran</Text>
                    </div>
                  )}

                  {data.ai_update_needed_score && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                      <Text style={{ fontSize: 16 }}>⚡</Text>
                      <Text strong style={{ fontSize: 13 }}>{data.ai_update_needed_score}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>Perlu Update</Text>
                    </div>
                  )}

                  {data.ai_fact_accuracy_score && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                      <Text style={{ fontSize: 16 }}>🛡️</Text>
                      <Text strong style={{ fontSize: 13 }}>{data.ai_fact_accuracy_score}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>Akurasi Fakta</Text>
                    </div>
                  )}

                  {data.ai_objectivity_score && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                      <Text style={{ fontSize: 16 }}>⚖️</Text>
                      <Text strong style={{ fontSize: 13 }}>{data.ai_objectivity_score}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>Objektivitas</Text>
                    </div>
                  )}

                  {data.ai_evidence_quality && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                      <Text style={{ fontSize: 16 }}>📚</Text>
                      <Text strong style={{ fontSize: 13 }}>{data.ai_evidence_quality}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>Kualitas Bukti</Text>
                    </div>
                  )}
                </div>
              </Panel>
            </Collapse>
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
            <Collapse ghost size="small" style={{ marginBottom: 12 }}>
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
                      <Timeline.Item dot={<CheckCircleOutlined />}>
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
