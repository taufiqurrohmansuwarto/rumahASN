import { Card, Space, Tag, Typography, Text } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

const KnowledgeContentHeader = ({ data }) => {
  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Judul */}
        <div>
          <Title level={2} style={{ marginBottom: "8px", color: "#262626" }}>
            {data?.title}
          </Title>
        </div>

        {/* Kategori dan Tags */}
        <Space wrap size="small">
          {data?.category && (
            <Tag
              color="blue"
              style={{
                fontSize: "13px",
                padding: "4px 12px",
                borderRadius: "16px",
                fontWeight: "500",
              }}
            >
              {data?.category?.name}
            </Tag>
          )}

          {data?.tags &&
            data.tags.length > 0 &&
            data.tags.map((tag, index) => (
              <Tag
                key={index}
                style={{
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "14px",
                  backgroundColor: "#f6f6f6",
                  border: "1px solid #d9d9d9",
                  color: "#595959",
                }}
              >
                #{tag}
              </Tag>
            ))}
        </Space>

        {/* Meta informasi */}
        <Space wrap size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
          <Space size="small">
            <Text type="secondary">
              📅 {dayjs(data?.created_at).format("DD MMMM YYYY")}
            </Text>
          </Space>
          {data?.updated_at && data?.updated_at !== data?.created_at && (
            <Space size="small">
              <Text type="secondary">
                🛠️ Diperbarui: {dayjs(data?.updated_at).format("DD MMMM YYYY")}
              </Text>
            </Space>
          )}
          <Space size="small">
            <Text type="secondary">👁️ {data?.views_count || 0} views</Text>
          </Space>
          <Space size="small">
            <Text type="secondary">👍 {data?.likes_count || 0} likes</Text>
          </Space>
          <Space size="small">
            <Text type="secondary">
              💬 {data?.comments_count || 0} komentar
            </Text>
          </Space>
        </Space>
      </Space>
    </Card>
  );
};

export default KnowledgeContentHeader;
