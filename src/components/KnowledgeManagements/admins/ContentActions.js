import { EditOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Tag, Typography } from "antd";

const { Text } = Typography;

const ContentActions = ({
  content,
  editContentMode,
  isMobile,
  getStatusInfo,
  onEditToggle,
  onStatusModalOpen,
}) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ marginBottom: "16px" }}
    >
      <Space wrap size="small">
        {/* Status */}
        <Text strong style={{ fontSize: "13px" }}>
          Status:
        </Text>
        <Tag color={getStatusInfo(content.status).color} size="small">
          {getStatusInfo(content.status).label}
        </Tag>

        {/* Category */}
        {content.category && (
          <>
            <Text strong style={{ fontSize: "13px" }}>
              Kategori:
            </Text>
            <Tag color="orange" size="small">
              {content.category.name}
            </Tag>
          </>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <>
            <Text strong style={{ fontSize: "13px" }}>
              Tags:
            </Text>
            {content.tags.slice(0, 2).map((tag, index) => (
              <Tag key={index} size="small" style={{ fontSize: "11px" }}>
                {tag}
              </Tag>
            ))}
            {content.tags.length > 2 && (
              <Tag size="small" style={{ fontSize: "11px" }}>
                +{content.tags.length - 2}
              </Tag>
            )}
          </>
        )}
      </Space>
      <Space size="small">
        <Button
          type={editContentMode ? "default" : "primary"}
          icon={<EditOutlined />}
          size="small"
          onClick={onEditToggle}
          style={
            editContentMode
              ? {}
              : {
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                }
          }
        >
          {editContentMode ? "Batal" : isMobile ? "Edit" : "Edit Konten"}
        </Button>
        <Button size="small" onClick={onStatusModalOpen}>
          {isMobile ? "Status" : "Ubah Status"}
        </Button>
      </Space>
    </Flex>
  );
};

export default ContentActions;