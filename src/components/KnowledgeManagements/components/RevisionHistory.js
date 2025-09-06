import {
  BranchesOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Card,
  Typography,
  Timeline,
  Tag,
  Flex,
  Button,
  Space,
  Empty,
  Spin,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const RevisionHistory = ({
  contentId,
  revisions = [],
  isLoading = false,
  currentUser = null,
  onEditRevision = () => {},
  onViewRevision = () => {},
  onCreateRevision = () => {},
  showCreateButton = false,
}) => {
  // Status config for revisions
  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: "#faad14",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
        icon: <EditOutlined />,
        text: "Draft",
        description: "Sedang dalam tahap editing"
      },
      pending_revision: {
        color: "#1890ff", 
        bgColor: "#e6f4ff",
        borderColor: "#91caff",
        icon: <ClockCircleOutlined />,
        text: "Pending Review",
        description: "Menunggu review admin"
      },
      approved: {
        color: "#52c41a",
        bgColor: "#f6ffed", 
        borderColor: "#b7eb8f",
        icon: <CheckCircleOutlined />,
        text: "Approved",
        description: "Revisi telah disetujui"
      },
      rejected: {
        color: "#ff4d4f",
        bgColor: "#fff2f0",
        borderColor: "#ffb3b3", 
        icon: <CloseCircleOutlined />,
        text: "Rejected",
        description: "Revisi ditolak"
      }
    };
    return configs[status] || configs.draft;
  };

  const formatVersion = (version) => {
    return version ? `v${version}` : "v1.0";
  };

  if (isLoading) {
    return (
      <Card
        size="small"
        style={{
          borderRadius: "8px",
          border: "1px solid #EDEFF1",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="small" />
          <Text style={{ display: "block", marginTop: "8px", color: "#666" }}>
            Memuat riwayat revisi...
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      style={{
        borderRadius: "8px", 
        border: "1px solid #EDEFF1",
        marginBottom: "16px",
      }}
      styles={{ body: { padding: "16px" } }}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
        <div>
          <Flex align="center" gap="8px">
            <BranchesOutlined style={{ color: "#0284C7", fontSize: "16px" }} />
            <Title level={5} style={{ margin: 0, color: "#1A1A1B" }}>
              Riwayat Revisi
            </Title>
          </Flex>
          <Text style={{ color: "#787C7E", fontSize: "12px" }}>
            {revisions?.length || 0} revisi tersimpan
          </Text>
        </div>
        
        {showCreateButton && (
          <Button
            size="small"
            type="primary"
            icon={<BranchesOutlined />}
            onClick={onCreateRevision}
            style={{
              backgroundColor: "#0284C7",
              borderColor: "#0284C7",
              fontSize: "12px",
              height: "28px",
            }}
          >
            Buat Revisi
          </Button>
        )}
      </Flex>

      {/* Timeline */}
      {revisions && revisions.length > 0 ? (
        <Timeline
          mode="left"
          style={{ marginTop: "8px" }}
          items={revisions.map((revision, index) => {
            const statusConfig = getStatusConfig(revision.status);
            const isOwner = currentUser && revision.author_id === currentUser.custom_id;
            const canEdit = isOwner && revision.status === 'draft';
            
            return {
              color: statusConfig.color,
              dot: statusConfig.icon,
              children: (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: statusConfig.bgColor,
                    border: `1px solid ${statusConfig.borderColor}`,
                    borderRadius: "6px",
                    marginBottom: "8px",
                  }}
                >
                  {/* Header */}
                  <Flex justify="space-between" align="flex-start" style={{ marginBottom: "8px" }}>
                    <div>
                      <Flex align="center" gap="8px" style={{ marginBottom: "4px" }}>
                        <Text strong style={{ color: "#1A1A1B", fontSize: "14px" }}>
                          {formatVersion(revision.version)}
                        </Text>
                        <Tag
                          color={statusConfig.color}
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            margin: 0,
                            borderRadius: "4px",
                          }}
                        >
                          {statusConfig.text}
                        </Tag>
                      </Flex>
                      
                      <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                        {statusConfig.description}
                      </Text>
                    </div>

                    <Space size={4}>
                      <Button
                        size="small"
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => onViewRevision(revision)}
                        style={{
                          color: "#666",
                          fontSize: "12px",
                          height: "24px",
                          width: "24px",
                        }}
                      />
                      {canEdit && (
                        <Button
                          size="small" 
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => onEditRevision(revision)}
                          style={{
                            color: "#0284C7",
                            fontSize: "12px",
                            height: "24px", 
                            width: "24px",
                          }}
                        />
                      )}
                    </Space>
                  </Flex>

                  {/* Content Preview */}
                  {revision.title && (
                    <Text
                      style={{
                        display: "block",
                        color: "#374151",
                        fontSize: "13px",
                        marginBottom: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {revision.title}
                    </Text>
                  )}

                  {revision.change_notes && (
                    <Text
                      style={{
                        display: "block",
                        color: "#6B7280",
                        fontSize: "12px",
                        marginBottom: "8px",
                        fontStyle: "italic",
                      }}
                    >
                      💬 {revision.change_notes}
                    </Text>
                  )}

                  {/* Footer */}
                  <Flex justify="space-between" align="center" style={{ marginTop: "8px" }}>
                    <Flex align="center" gap="6px">
                      <UserOutlined style={{ color: "#9CA3AF", fontSize: "12px" }} />
                      <Text style={{ color: "#9CA3AF", fontSize: "11px" }}>
                        {revision.author?.username || "Unknown"}
                      </Text>
                    </Flex>
                    
                    <Text style={{ color: "#9CA3AF", fontSize: "11px" }}>
                      {dayjs(revision.created_at).fromNow()}
                    </Text>
                  </Flex>
                </div>
              ),
            };
          })}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: 40 }}
          description={
            <Text style={{ color: "#9CA3AF", fontSize: "13px" }}>
              Belum ada revisi untuk konten ini
            </Text>
          }
        />
      )}
    </Card>
  );
};

export default RevisionHistory;