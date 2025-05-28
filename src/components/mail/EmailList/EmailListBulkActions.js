// components/mail/EmailList/EmailListBulkActions.js
import { DeleteOutlined } from "@ant-design/icons";
import { Badge, Button, Divider, Space, Typography } from "antd";

const { Text } = Typography;

const EmailListBulkActions = ({
  config,
  selectedEmails = [],
  isLoading = false,
  onBulkDelete,
  onClearSelection,
}) => {
  if (selectedEmails.length === 0) {
    return null;
  }

  const handleBulkDelete = () => {
    onBulkDelete?.();
  };

  const handleClearSelection = () => {
    onClearSelection?.();
  };

  return (
    <>
      <Divider style={{ margin: "16px 0 12px 0" }} />
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#e6f7ff",
          borderRadius: "6px",
          border: "1px solid #91d5ff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Badge
            count={selectedEmails.length}
            style={{ backgroundColor: config.primaryColor }}
          />
          <Text strong>{selectedEmails.length} email dipilih</Text>
        </Space>
        <Space>
          {/* Bulk Delete - show if folder supports it */}
          {config.bulkActions.includes("delete") && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              loading={isLoading}
            >
              Hapus yang Dipilih
            </Button>
          )}

          {/* Bulk Restore - for trash folder */}
          {config.bulkActions.includes("restore") && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                // TODO: implement bulk restore
                console.log("Bulk restore", selectedEmails);
              }}
              loading={isLoading}
            >
              Pulihkan yang Dipilih
            </Button>
          )}

          {/* Clear Selection */}
          <Button onClick={handleClearSelection}>Batal Pilih</Button>
        </Space>
      </div>
    </>
  );
};

export default EmailListBulkActions;
