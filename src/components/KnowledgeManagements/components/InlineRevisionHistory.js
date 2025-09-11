import { Collapse, Typography, Tag, Space } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const InlineRevisionHistory = ({
  revisions = [],
  contentId,
  onViewRevision,
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: "orange", text: "Draft" },
      pending_revision: { color: "blue", text: "Review" },
      published: { color: "green", text: "Live" },
      revision_rejected: { color: "red", text: "Ditolak" },
    };
    return configs[status] || configs.draft;
  };

  if (!revisions || revisions.length === 0) {
    return null;
  }

  const items = [
    {
      key: "1",
      label: (
        <Space size={8}>
          <HistoryOutlined style={{ color: "#FF4500" }} />
          <Text style={{ fontSize: "13px", fontWeight: 500 }}>
            Riwayat ({revisions.length})
          </Text>
        </Space>
      ),
      children: (
        <div style={{ paddingTop: "8px" }}>
          {revisions.map((revision, index) => (
            <div
              key={revision.id || index}
              style={{
                padding: "6px 8px",
                marginBottom: "4px",
                background: "#FAFAFA",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.2s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F0F0F0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FAFAFA")
              }
              onClick={() => onViewRevision && onViewRevision(revision)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "2px" }}>
                  <Text style={{ fontSize: "12px", fontWeight: 500 }}>
                    v{revision.version}
                  </Text>
                  <Tag
                    size="small"
                    color={getStatusConfig(revision.status).color}
                    style={{ fontSize: "10px", marginLeft: "6px" }}
                  >
                    {getStatusConfig(revision.status).text}
                  </Tag>
                </div>
                <Text style={{ fontSize: "10px", color: "#999" }}>
                  {dayjs(revision.updated_at).fromNow()}
                </Text>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Collapse
      items={items}
      size="small"
      style={{
        marginTop: "12px",
        background: "transparent",
        border: "1px solid #E8E8E8",
        borderRadius: "6px",
      }}
      expandIconPosition="end"
    />
  );
};

export default InlineRevisionHistory;
