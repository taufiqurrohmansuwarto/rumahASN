import {
  ActionIcon,
  Alert,
  Badge,
  Collapse,
  Divider,
  Group,
  List,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBrain,
  IconBulb,
  IconChart,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconEye,
  IconHeart,
  IconLink,
  IconRobot,
  IconSparkles,
  IconStar,
  IconTags,
  IconTarget,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useState } from "react";

const AIMetadataPanel = ({ data, className, ...props }) => {
  const [collapsed, setCollapsed] = useState({
    insights: false,
    suggestions: true,
    technical: true,
  });

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
    <div
      style={{ marginTop: "24px", paddingLeft: "14px", paddingRight: "14px" }}
      className={className}
      {...props}
    >
      <Stack spacing="xs" mb="md">
        <Group spacing={8} align="center">
          <IconRobot size={20} color="#262626" />
          <Title
            order={4}
            style={{
              margin: 0,
              color: "#262626",
              fontWeight: 600,
            }}
          >
            Metadata AI
          </Title>
        </Group>
        <Text
          color="dimmed"
          italic
          style={{
            fontSize: 13,
            marginTop: 4,
          }}
        >
          Informasi dan analisis konten yang dihasilkan secara otomatis
          menggunakan kecerdasan buatan untuk membantu meningkatkan kualitas dan
          pemahaman konten.
        </Text>
      </Stack>
      <Stack spacing="sm">
        {/* AI Summary - Only show if exists */}
        {data.ai_summary && (
          <Stack spacing="xs">
            <Group spacing={8}>
              <IconBrain size={16} color="#FF4500" />
              <Text size="sm" weight={600} color="dimmed">
                AI Ringkasan
              </Text>
            </Group>
            <Text size="sm" style={{ lineHeight: 1.5, fontStyle: "italic" }}>
              &quot;{data.ai_summary}&quot;
            </Text>
          </Stack>
        )}

        {/* Keywords & Tags - Only show if exists */}
        {(keywords.length > 0 || tags.length > 0) && (
          <Stack spacing="xs">
            <Group spacing={8}>
              <IconTags size={16} color="#FF4500" />
              <Text size="sm" weight={600} color="dimmed">
                Topik Terkait
              </Text>
            </Group>
            <Group spacing={6}>
              {keywords.slice(0, 6).map((keyword, idx) => (
                <Badge key={idx} size="sm" variant="light" color="blue">
                  {keyword}
                </Badge>
              ))}
              {tags.slice(0, 4).map((tag, idx) => (
                <Badge
                  key={`tag-${idx}`}
                  size="sm"
                  variant="outline"
                  color="orange"
                >
                  #{tag}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}

        {/* Related Content - Only show if exists */}
        {relatedContent.length > 0 && (
          <Stack spacing="xs">
            <Group spacing={8}>
              <IconLink size={16} color="#FF4500" />
              <Text size="sm" weight={600} color="dimmed">
                Artikel Terkait
              </Text>
            </Group>
            <List spacing="xs" size="sm">
              {relatedContent.slice(0, 3).map((content, idx) => (
                <List.Item key={idx}>
                  <Text
                    size="sm"
                    component="a"
                    href={content.url || "#"}
                    style={{ color: "#1c7ed6", textDecoration: "none" }}
                  >
                    {content.title || content}
                  </Text>
                </List.Item>
              ))}
            </List>
          </Stack>
        )}

        {/* Reading Time Estimate - Only show if summary exists */}
        {data.ai_summary && (
          <Group spacing={8}>
            <IconClock size={16} color="#FF4500" />
            <Text size="xs" color="dimmed">
              Estimasi baca:{" "}
              {Math.ceil(data.ai_summary.split(" ").length / 200)} menit
            </Text>
          </Group>
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
          <Stack spacing="sm">
            <Group spacing={8} position="apart">
              <Group spacing={8}>
                <IconChart size={18} color="#FF4500" />
                <Text weight={600}>Analisis Konten</Text>
              </Group>
              <ActionIcon
                variant="subtle"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    insights: !prev.insights,
                  }))
                }
              >
                {collapsed.insights ? (
                  <IconChevronRight size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={!collapsed.insights}>
              <Stack spacing="md">
                {/* Quality Scores */}
                <Group grow>
                  {data.ai_quality_score && (
                    <Stack spacing={4} align="center">
                      <ThemeIcon
                        color={getScoreColor(data.ai_quality_score)}
                        size="lg"
                      >
                        <IconStar size={16} />
                      </ThemeIcon>
                      <Text size="xl" weight={700}>
                        {data.ai_quality_score}
                      </Text>
                      <Text size="xs" color="dimmed">
                        Kualitas
                      </Text>
                      <Progress
                        value={data.ai_quality_score}
                        color={getScoreColor(data.ai_quality_score)}
                        size="xs"
                        style={{ width: "100%" }}
                      />
                    </Stack>
                  )}

                  {data.ai_readability_score !== null &&
                    data.ai_readability_score !== undefined && (
                      <Stack spacing={4} align="center">
                        <ThemeIcon
                          color={getScoreColor(data.ai_readability_score)}
                          size="lg"
                        >
                          <IconEye size={16} />
                        </ThemeIcon>
                        <Text size="xl" weight={700}>
                          {data.ai_readability_score}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {getReadabilityLevel(data.ai_readability_score)}
                        </Text>
                        <Progress
                          value={data.ai_readability_score}
                          color={getScoreColor(data.ai_readability_score)}
                          size="xs"
                          style={{ width: "100%" }}
                        />
                      </Stack>
                    )}

                  {data.ai_completeness_score && (
                    <Stack spacing={4} align="center">
                      <ThemeIcon
                        color={getScoreColor(data.ai_completeness_score)}
                        size="lg"
                      >
                        <IconTarget size={16} />
                      </ThemeIcon>
                      <Text size="xl" weight={700}>
                        {data.ai_completeness_score}
                      </Text>
                      <Text size="xs" color="dimmed">
                        Kelengkapan
                      </Text>
                      <Progress
                        value={data.ai_completeness_score}
                        color={getScoreColor(data.ai_completeness_score)}
                        size="xs"
                        style={{ width: "100%" }}
                      />
                    </Stack>
                  )}
                </Group>

                {/* Category Suggestion - Only show if exists and not null */}
                {data.ai_suggested_category &&
                  data.ai_suggested_category !== null &&
                  data.ai_suggested_category !== "null" && (
                    <Alert
                      icon={<IconBulb size={16} />}
                      color="blue"
                      variant="light"
                    >
                      <Text size="sm">
                        <strong>Saran Kategori:</strong>{" "}
                        {data.ai_suggested_category}
                        {data.ai_confidence_score &&
                          parseFloat(data.ai_confidence_score) > 0 && (
                            <Text span color="dimmed">
                              &nbsp;(Kepercayaan:{" "}
                              {Math.round(
                                parseFloat(data.ai_confidence_score) * 100
                              )}
                              %)
                            </Text>
                          )}
                      </Text>
                    </Alert>
                  )}
              </Stack>
            </Collapse>
          </Stack>
        )}

        {/* Content Suggestions - Only show if exists */}
        {suggestions.length > 0 && (
          <Stack spacing="sm">
            <Group spacing={8} position="apart">
              <Group spacing={8}>
                <IconSparkles size={18} color="#FF4500" />
                <Text weight={600}>Saran Perbaikan</Text>
                <Badge size="xs" color="orange">
                  {suggestions.length}
                </Badge>
              </Group>
              <ActionIcon
                variant="subtle"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    suggestions: !prev.suggestions,
                  }))
                }
              >
                {collapsed.suggestions ? (
                  <IconChevronRight size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={!collapsed.suggestions}>
              <List spacing="xs" size="sm">
                {suggestions.map((suggestion, idx) => (
                  <List.Item key={idx} icon={<IconBulb size={12} />}>
                    <Text size="sm">{suggestion}</Text>
                  </List.Item>
                ))}
              </List>
            </Collapse>
          </Stack>
        )}

        {/* SEO Info - Only show if exists */}
        {(seoKeywords.length > 0 || data.ai_meta_description) && (
          <Alert
            icon={<IconTrendingUp size={16} />}
            color="green"
            variant="light"
          >
            <Stack spacing="xs">
              <Text size="sm" weight={600}>
                Optimisasi SEO
              </Text>
              {data.ai_meta_description && (
                <Text size="xs">
                  <strong>Deskripsi Meta:</strong> {data.ai_meta_description}
                </Text>
              )}
              {seoKeywords.length > 0 && (
                <Group spacing={4}>
                  <Text size="xs" weight={500}>
                    Kata Kunci:
                  </Text>
                  {seoKeywords.slice(0, 5).map((keyword, idx) => (
                    <Badge key={idx} size="xs" color="green">
                      {keyword}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
          </Alert>
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
          <Stack spacing="sm">
            <Group spacing={8} position="apart">
              <Group spacing={8}>
                <IconRobot size={18} color="#FF4500" />
                <Text weight={600}>Detail Teknis</Text>
              </Group>
              <ActionIcon
                variant="subtle"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    technical: !prev.technical,
                  }))
                }
              >
                {collapsed.technical ? (
                  <IconChevronRight size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={!collapsed.technical}>
              <Timeline active={-1} bulletSize={24}>
                {/* Processing Status - Only show if exists */}
                {data.processing_status && (
                  <Timeline.Item
                    bullet={<IconRobot size={12} />}
                    title="Status Pemrosesan"
                  >
                    <Group spacing="xs">
                      <Badge
                        color={
                          data.processing_status === "completed"
                            ? "green"
                            : "orange"
                        }
                        variant="filled"
                      >
                        {data.processing_status || "unknown"}
                      </Badge>
                      <Text size="xs" color="dimmed">
                        Model: {data.model_version || "Tidak Ada"}
                      </Text>
                    </Group>
                    {data.last_processed && (
                      <Text size="xs" color="dimmed" mt={4}>
                        Diproses:{" "}
                        {new Date(data.last_processed).toLocaleString("id-ID")}
                      </Text>
                    )}
                  </Timeline.Item>
                )}

                {/* Sentiment Analysis - Only show if exists */}
                {data.ai_sentiment_score !== null &&
                  data.ai_sentiment_score !== undefined && (
                    <Timeline.Item
                      bullet={<IconHeart size={12} />}
                      title="Analisis Sentimen"
                    >
                      <Group spacing="xs">
                        <Badge color={sentiment.color} variant="light">
                          {sentiment.label}
                        </Badge>
                        <Text size="xs" color="dimmed">
                          Skor: {Number(data.ai_sentiment_score).toFixed(2)}
                        </Text>
                      </Group>
                    </Timeline.Item>
                  )}

                {/* Confidence Score - Only show if exists and greater than 0 */}
                {data.ai_confidence_score &&
                  parseFloat(data.ai_confidence_score) > 0 && (
                    <Timeline.Item
                      bullet={<IconTarget size={12} />}
                      title="Kepercayaan AI"
                    >
                      <Group spacing="xs">
                        <Progress
                          value={parseFloat(data.ai_confidence_score) * 100}
                          color={getScoreColor(
                            parseFloat(data.ai_confidence_score) * 100
                          )}
                          size="lg"
                          style={{ width: 200 }}
                        />
                        <Text size="sm" weight={600}>
                          {Math.round(
                            parseFloat(data.ai_confidence_score) * 100
                          )}
                          %
                        </Text>
                      </Group>
                    </Timeline.Item>
                  )}

                {/* Error Messages - Only show if exists */}
                {data.error_message && (
                  <Timeline.Item
                    bullet={<IconAlertTriangle size={12} />}
                    title="Log Kesalahan"
                    color="red"
                  >
                    <Alert color="red" variant="light" size="sm">
                      {data.error_message}
                    </Alert>
                  </Timeline.Item>
                )}
              </Timeline>
            </Collapse>
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default AIMetadataPanel;
