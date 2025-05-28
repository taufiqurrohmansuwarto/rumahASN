// components/mail/EmailList/EmailListEmpty.js
import { EditOutlined } from "@ant-design/icons";
import { Button, Empty, Typography } from "antd";

const { Text } = Typography;

const EmailListEmpty = ({
  config,
  hasSearchQuery = false,
  searchQuery = "",
  onCompose,
}) => {
  const handleCompose = () => {
    onCompose?.();
  };

  // If user is searching and no results found
  if (hasSearchQuery) {
    return (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <Empty
          description={`Tidak ada email yang cocok dengan pencarian "${searchQuery}"`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text
            type="secondary"
            style={{ display: "block", marginTop: "16px" }}
          >
            Coba gunakan kata kunci yang berbeda atau periksa ejaan Anda
          </Text>
        </Empty>
      </div>
    );
  }

  // Default empty state based on folder config
  return (
    <div style={{ padding: "48px 20px", textAlign: "center" }}>
      <Empty
        description={config.emptyTitle}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {config.emptyAction && (
          <div style={{ marginTop: "16px" }}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: "16px" }}
            >
              {config.emptyDescription}
            </Text>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              onClick={handleCompose}
            >
              {config.emptyAction.label}
            </Button>
          </div>
        )}
        {!config.emptyAction && (
          <Text
            type="secondary"
            style={{ display: "block", marginTop: "16px" }}
          >
            {config.emptyDescription}
          </Text>
        )}
      </Empty>
    </div>
  );
};

export default EmailListEmpty;
