import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { FileViewer, ReviewPanel } from "@/components/RasnNaskah/DocumentDetail";
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
import { Stack, Text, Group } from "@mantine/core";
import {
  IconFile,
  IconFileTypePdf,
  IconBookmark,
  IconBookmarkFilled,
  IconClipboard,
  IconUser,
} from "@tabler/icons-react";
import { Badge, Button, Card, Col, Empty, Row, Select, Space, Spin, Tabs } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Helper functions
const getScoreColor = (score) => {
  if (score >= 80) return "#52c41a";
  if (score >= 60) return "#faad14";
  return "#f5222d";
};

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

dayjs.extend(relativeTime);
dayjs.locale("id");

const RasnNaskahDocumentDetail = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const queryClient = useQueryClient();
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [activeTab, setActiveTab] = useState("content");

  const { data: doc, isLoading, refetch } = useRasnNaskahDocumentDetail(documentId);
  const { data: reviewData, isLoading: reviewLoading } = useRasnNaskahDocumentReview(documentId);
  const { data: usersWithPrefs } = useRasnNaskahUsersWithPreferences();

  // Poll for updates when content is being formatted
  useEffect(() => {
    let interval = null;
    if (doc?.content_status === "formatting") {
      interval = setInterval(() => {
        refetch();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [doc?.content_status, refetch]);

  // Get the latest completed review
  const review = useMemo(() => {
    if (Array.isArray(reviewData)) {
      return reviewData.find((r) => r.status === "completed");
    }
    return reviewData?.status === "completed" ? reviewData : null;
  }, [reviewData]);

  // Clean markdown content - remove ```markdown wrapper if present
  const cleanContent = useMemo(() => {
    if (!doc?.content) return null;
    let content = doc.content.trim();
    // Remove ```markdown at start and ``` at end
    if (content.startsWith("```markdown")) {
      content = content.slice(11); // Remove "```markdown"
    } else if (content.startsWith("```")) {
      content = content.slice(3); // Remove "```"
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3); // Remove trailing "```"
    }
    return content.trim();
  }, [doc?.content]);

  const issues = review?.issues || [];
  const pendingReview = doc?.reviews?.find((r) =>
    ["pending", "processing"].includes(r.status)
  );

  // Mutations
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      doc?.is_bookmarked ? removeBookmark(documentId) : addBookmark(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-document", documentId]);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (selectedTargetUser) {
        return requestReviewWithOptions(documentId, {
          targetUserId: selectedTargetUser,
        });
      }
      return startReview(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-document", documentId]);
      queryClient.invalidateQueries(["rasn-naskah-review", documentId]);
    },
  });

  return (
    <>
      <Head>
        <title>SAKTI Naskah - {doc?.title || "Dokumen"}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title={doc?.title || "Dokumen"}
        subTitle={doc?.document_number || "-"}
        loading={isLoading}
        breadcrumb={{
          items: [
            { title: "SAKTI Naskah", path: "/rasn-naskah" },
            { title: "Dokumen" },
          ],
        }}
        extra={
          <Group gap={12} align="center" wrap="nowrap">
            {/* Score */}
            {review && (
              <Badge
                count={review.score || 0}
                overflowCount={100}
                style={{
                  backgroundColor: getScoreColor(review.score || 0),
                  fontWeight: 600,
                }}
              />
            )}
            {/* Target User */}
            <Select
              size="small"
              placeholder="Tujuan"
              allowClear
              value={selectedTargetUser}
              onChange={setSelectedTargetUser}
              style={{ width: 150 }}
              suffixIcon={<IconUser size={12} />}
            >
              {usersWithPrefs?.map((user) => (
                <Select.Option key={user.id} value={user.user_id}>
                  {user.user_name}
                </Select.Option>
              ))}
            </Select>
            {/* Bookmark */}
            <Button
              size="small"
              type="text"
              icon={
                doc?.is_bookmarked ? (
                  <IconBookmarkFilled size={16} color="#faad14" />
                ) : (
                  <IconBookmark size={16} />
                )
              }
              onClick={() => bookmarkMutation.mutate()}
              loading={bookmarkMutation.isLoading}
            />
            {/* Review AI */}
            {pendingReview ? (
              <Button size="small" loading>
                Reviewing...
              </Button>
            ) : (
              <Button
                size="small"
                type="primary"
                icon={<IconClipboard size={14} />}
                onClick={() => reviewMutation.mutate()}
                loading={reviewMutation.isLoading}
              >
                Review AI
              </Button>
            )}
          </Group>
        }
      >
        <Spin spinning={reviewLoading}>
          {/* Main Content */}
          <Row gutter={16}>
            {/* Left: Document View */}
            <Col xs={24} lg={14}>
              <Card
                size="small"
                style={{
                  height: "calc(100vh - 240px)",
                  display: "flex",
                  flexDirection: "column",
                }}
                styles={{
                  body: {
                    flex: 1,
                    overflow: "hidden",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                  },
                }}
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
                          <span>Konten</span>
                        </Space>
                      ),
                    },
                    {
                      key: "file",
                      label: (
                        <Space size={4}>
                          <IconFileTypePdf size={14} />
                          <span>File Asli</span>
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
                        <Stack align="center" py={40}>
                          <Spin />
                          <Text c="dimmed" mt={16}>
                            Memformat konten dengan AI...
                          </Text>
                        </Stack>
                      ) : cleanContent ? (
                        <ReactMarkdownCustom>{cleanContent}</ReactMarkdownCustom>
                      ) : (
                        <Empty
                          description="Tidak ada konten"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
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
              <ReviewPanel
                review={review}
                issues={issues}
                usersWithPrefs={usersWithPrefs}
                selectedTargetUser={selectedTargetUser}
                onReviewAgain={() => reviewMutation.mutate()}
                reviewLoading={reviewMutation.isLoading}
                documentUrl={doc?.original_file_url}
              />
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
