import { List, Typography, Tag, Space } from "antd";
import { BranchesOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const InlineRevisionHistory = ({ 
  revisions = [], 
  contentId,
  onViewRevision
}) => {
  
  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: "orange", text: "Draft" },
      pending_revision: { color: "blue", text: "Pending Review" },
      published: { color: "green", text: "Published" },
      revision_rejected: { color: "red", text: "Rejected" }
    };
    return configs[status] || configs.draft;
  };

  if (!revisions || revisions.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ marginBottom: "8px" }}>
        <Text style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>
          Riwayat Revisi ({revisions.length})
        </Text>
      </div>
      
      <List
        size="small"
        dataSource={revisions.slice(0, 3)} // Show max 3 recent revisions
        renderItem={(revision) => (
          <List.Item
            style={{ 
              padding: "8px 12px", 
              background: "#fff7e6",
              borderRadius: "6px",
              marginBottom: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
              border: "1px solid #ffd591"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffec99";
              e.currentTarget.style.borderColor = "#ff7a00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff7e6"; 
              e.currentTarget.style.borderColor = "#ffd591";
            }}
            onClick={() => onViewRevision && onViewRevision(revision)}
          >
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Left: Revision Info */}
              <div style={{ flex: 1 }}>
                <Space size={8}>
                  <BranchesOutlined style={{ fontSize: "12px", color: "#ff7a00" }} />
                  <Text style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>
                    Revisi v{revision.current_version}
                  </Text>
                  <Tag 
                    size="small" 
                    color={getStatusConfig(revision.status).color}
                    style={{ fontSize: "10px", padding: "1px 6px", lineHeight: "16px" }}
                  >
                    {getStatusConfig(revision.status).text}
                  </Tag>
                </Space>
                <div style={{ marginTop: "2px" }}>
                  <Text style={{ fontSize: "11px", color: "#999" }}>
                    {dayjs(revision.updated_at).fromNow()}
                  </Text>
                </div>
              </div>

              {/* Right: Simple View Indicator */}
              <EyeOutlined 
                style={{ 
                  fontSize: "14px", 
                  color: "#ff7a00",
                  opacity: 0.7
                }} 
              />
            </div>
          </List.Item>
        )}
      />
      
      {revisions.length > 3 && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Text
            style={{ 
              fontSize: "11px", 
              color: "#ff7a00",
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={() => {
              // Navigate to full revision list
              window.location.href = `/asn-connect/asn-knowledge/my-knowledge/${contentId}/revisions`;
            }}
          >
            Lihat semua {revisions.length} revisi →
          </Text>
        </div>
      )}
    </div>
  );
};

export default InlineRevisionHistory;