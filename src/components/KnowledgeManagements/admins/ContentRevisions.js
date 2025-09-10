import { useAdminContentRevisions } from "@/hooks/knowledge-management/useRevisions";
import {
  HistoryOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Card,
  Timeline,
  Typography,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  message,
  Tooltip,
} from "antd";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

/**
 * Content Revisions Component for Admin
 * Shows revision history for a specific content (read-only)
 */
const ContentRevisions = ({ contentId, isMobile = false }) => {
  // Fetch revisions for this content (admin endpoint)
  const {
    data: revisionData,
    isLoading,
    isError,
    refetch,
  } = useAdminContentRevisions(contentId);

  // Extract revisions array from the structured response
  const revisions = revisionData?.revisions || [];

  // Get status info for styling
  const getStatusInfo = (status) => {
    const statusConfig = {
      draft: {
        color: "#d9d9d9",
        icon: <EditOutlined />,
        label: "Draft",
        description: "Masih dalam proses edit",
      },
      pending_revision: {
        color: "#faad14",
        icon: <ExclamationCircleOutlined />,
        label: "Pending Review",
        description: "Menunggu review admin",
      },
      revision_approved: {
        color: "#52c41a",
        icon: <CheckCircleOutlined />,
        label: "Approved",
        description: "Revisi telah disetujui",
      },
      revision_rejected: {
        color: "#ff4d4f",
        icon: <CloseCircleOutlined />,
        label: "Rejected",
        description: "Revisi ditolak",
      },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  if (isLoading) {
    return (
      <Card
        id="content-revisions"
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #EDEFF1",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card
        id="content-revisions"
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #EDEFF1",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Text type="danger">Error loading revisions</Text>
          <div style={{ marginTop: "16px" }}>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </Card>
    );
  }

  const hasRevisions = revisions && revisions.length > 0;
  const totalCount = revisionData?.total || 0;
  const pendingCount = revisionData?.pending_count || 0;

  return (
    <>
      <Card
        id="content-revisions"
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #EDEFF1",
        }}
        title={
          <div style={{ padding: "4px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <HistoryOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
              <Text strong style={{ fontSize: "16px" }}>
                Riwayat Revisi
              </Text>
              {hasRevisions && <Tag color="blue">{totalCount}</Tag>}
              {pendingCount > 0 && (
                <Tag color="orange">{pendingCount} Pending</Tag>
              )}
            </div>
            {revisionData?.content && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginLeft: "24px",
                  paddingLeft: "8px",
                  borderLeft: "2px solid #f0f0f0",
                }}
              >
                Untuk konten:{" "}
                <Text style={{ fontWeight: 500, color: "#333" }}>
                  {revisionData.content.title}
                </Text>
                {revisionData.content.author && (
                  <span>
                    {" "}
                    • Oleh:{" "}
                    <Text style={{ fontWeight: 500 }}>
                      {revisionData.content.author.username}
                    </Text>
                  </span>
                )}
              </div>
            )}
          </div>
        }
        styles={{ body: { padding: hasRevisions ? "24px" : "40px" } }}
      >
        {!hasRevisions ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Belum ada revisi untuk konten ini</Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Revisi akan muncul ketika author membuat perubahan pada konten
                  yang sudah dipublikasi
                </Text>
              </div>
            }
          />
        ) : (
          <Timeline
            items={revisions.map((revision, index) => {
              const statusInfo = getStatusInfo(revision.status);
              const isLatest = index === 0;

              return {
                color: statusInfo.color,
                dot: statusInfo.icon,
                children: (
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: isLatest ? "#F8F9FA" : "transparent",
                      borderRadius: "8px",
                      border: isLatest ? "1px solid #E8E8E8" : "none",
                      marginBottom: "8px",
                    }}
                  >
                    {/* Title */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                        marginBottom: "8px",
                      }}
                    >
                      <Text strong style={{ fontSize: "14px" }}>
                        Version {revision.version}
                      </Text>
                      {isLatest && (
                        <Tag color="blue" size="small">
                          Latest
                        </Tag>
                      )}
                      <Tag
                        color={statusInfo.color}
                        size="small"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        {statusInfo.label}
                      </Tag>
                      {revision.status === "revision_approved" && (
                        <Tag color="green" size="small">
                          Applied
                        </Tag>
                      )}
                    </div>

                    {/* Metadata */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <UserOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text style={{ fontSize: "12px", color: "#666" }}>
                          {revision.updated_by?.username ||
                            revision.user_updated?.username ||
                            "System"}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CalendarOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text style={{ fontSize: "12px", color: "#666" }}>
                          {dayjs(revision.created_at).format(
                            "DD MMM YYYY, HH:mm"
                          )}
                        </Text>
                      </div>
                    </div>

                    {/* Change Notes */}
                    {revision.change_notes && (
                      <div style={{ marginTop: "8px" }}>
                        <Text
                          strong
                          style={{ fontSize: "12px", color: "#333" }}
                        >
                          Catatan Perubahan:
                        </Text>
                        <Text
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginLeft: "4px",
                            display: "block",
                            marginTop: "2px",
                          }}
                        >
                          {revision.change_notes}
                        </Text>
                      </div>
                    )}

                    {/* Admin Review Notes */}
                    {revision.review_notes &&
                      !revision.review_notes.includes(
                        "Revision created from"
                      ) &&
                      !revision.review_notes.includes(
                        "Revision content modified"
                      ) &&
                      !revision.review_notes.includes(
                        "Content updated via"
                      ) && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "8px",
                            backgroundColor:
                              revision.status === "revision_approved"
                                ? "#f6ffed"
                                : "#fff2f0",
                            borderLeft: `3px solid ${
                              revision.status === "revision_approved"
                                ? "#52c41a"
                                : "#ff4d4f"
                            }`,
                            borderRadius: "4px",
                          }}
                        >
                          <Text style={{ fontSize: "12px", fontWeight: "500" }}>
                            Review Admin:
                          </Text>
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            {revision.review_notes}
                          </Text>
                        </div>
                      )}
                  </div>
                ),
              };
            })}
          />
        )}
      </Card>
    </>
  );
};

export default ContentRevisions;
