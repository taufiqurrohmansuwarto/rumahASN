import { LinkOutlined } from "@ant-design/icons";
import { Button, Divider, List, Space, Typography } from "antd";

const { Text, Link } = Typography;

const ContentReferences = ({ content }) => {
  if (!content.references || content.references.length === 0) {
    return null;
  }

  return (
    <>
      <Divider style={{ margin: "24px 0" }}>
        <Text style={{ color: "#666", fontSize: "14px" }}>
          🔗 Referensi ({content.references.length})
        </Text>
      </Divider>

      <div style={{ marginBottom: "24px" }}>
        <List
          dataSource={content.references}
          renderItem={(reference) => (
            <List.Item>
              <Space>
                <LinkOutlined style={{ color: "#1890ff" }} />
                <div>
                  <Text strong style={{ display: "block", marginBottom: "4px" }}>
                    {reference.title || "Referensi"}
                  </Text>
                  <Link
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px" }}
                  >
                    {reference.url}
                  </Link>
                </div>
              </Space>
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default ContentReferences;