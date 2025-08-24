import { DownloadOutlined, FileOutlined } from "@ant-design/icons";
import { Button, Divider, List, Space, Typography } from "antd";

const { Text, Link } = Typography;

const ContentAttachments = ({ content }) => {
  if (!content.attachments || content.attachments.length === 0) {
    return null;
  }

  const getFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <Divider style={{ margin: "24px 0" }}>
        <Text style={{ color: "#666", fontSize: "14px" }}>
          📎 Lampiran ({content.attachments.length})
        </Text>
      </Divider>

      <div style={{ marginBottom: "24px" }}>
        <List
          dataSource={content.attachments}
          renderItem={(attachment) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="link"
                  icon={<DownloadOutlined />}
                  size="small"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  Download
                </Button>
              ]}
            >
              <Space>
                <FileOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
                <div>
                  <Text strong style={{ display: "block", marginBottom: "2px" }}>
                    {attachment.filename || attachment.name}
                  </Text>
                  <Text style={{ fontSize: "12px", color: "#666" }}>
                    {attachment.mimetype && `${attachment.mimetype} • `}
                    {getFileSize(attachment.size)}
                  </Text>
                </div>
              </Space>
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default ContentAttachments;