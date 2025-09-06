import {
  BranchesOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  Modal,
  Typography,
  Space,
  Button,
  Divider,
  Alert,
  Flex,
} from "antd";

const { Text, Title } = Typography;

const RevisionCreateModal = ({
  visible,
  onCancel,
  onConfirm,
  isLoading = false,
  contentTitle = "",
  currentVersion = "1.0",
}) => {
  const nextVersion = currentVersion ? 
    `${parseFloat(currentVersion) + 0.1}` : 
    "1.1";

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={480}
      styles={{
        body: {
          padding: "24px",
        }
      }}
    >
      {/* Header */}
      <Flex align="center" gap="12px" style={{ marginBottom: "20px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#E6F4FF",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BranchesOutlined style={{ color: "#1890FF", fontSize: "18px" }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, color: "#1A1A1B" }}>
            Buat Revisi Baru
          </Title>
          <Text style={{ color: "#787C7E", fontSize: "13px" }}>
            Buat versi baru dari konten ini
          </Text>
        </div>
      </Flex>

      {/* Content Info */}
      <div
        style={{
          backgroundColor: "#F8F9FA",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #EDEFF1",
        }}
      >
        <Text strong style={{ color: "#374151", fontSize: "14px", display: "block", marginBottom: "8px" }}>
          {contentTitle}
        </Text>
        
        <Flex align="center" gap="12px">
          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: "11px", display: "block" }}>
              Versi Saat Ini
            </Text>
            <Text strong style={{ color: "#1890FF", fontSize: "13px" }}>
              v{currentVersion}
            </Text>
          </div>
          
          <ArrowRightOutlined style={{ color: "#9CA3AF", fontSize: "12px" }} />
          
          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: "11px", display: "block" }}>
              Versi Baru
            </Text>
            <Text strong style={{ color: "#52C41A", fontSize: "13px" }}>
              v{nextVersion}
            </Text>
          </div>
        </Flex>
      </div>

      {/* Info Alert */}
      <Alert
        message="Informasi Revisi"
        description={
          <div>
            <Text style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
              Setelah membuat revisi baru:
            </Text>
            <ul style={{ margin: 0, paddingLeft: "16px", color: "#6B7280", fontSize: "12px" }}>
              <li>Anda dapat mengedit konten tanpa mengubah versi yang dipublikasikan</li>
              <li>Revisi akan berstatus "Draft" hingga Anda submit untuk review</li>
              <li>Admin akan me-review revisi sebelum dipublikasikan</li>
            </ul>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        style={{
          marginBottom: "24px",
          backgroundColor: "#E6F4FF",
          border: "1px solid #BAE6FD",
        }}
        styles={{
          message: {
            fontSize: "13px",
            fontWeight: 600,
            color: "#1890FF",
          },
        }}
      />

      <Divider style={{ margin: "20px 0" }} />

      {/* Footer Actions */}
      <Flex justify="flex-end" gap="12px">
        <Button
          onClick={onCancel}
          style={{
            borderColor: "#D1D5DB",
            color: "#6B7280",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#9CA3AF";
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#D1D5DB"; 
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          Batal
        </Button>
        
        <Button
          type="primary"
          icon={<BranchesOutlined />}
          onClick={onConfirm}
          loading={isLoading}
          style={{
            backgroundColor: "#1890FF",
            borderColor: "#1890FF",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#0F7AE5";
              e.currentTarget.style.borderColor = "#0F7AE5";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#1890FF";
              e.currentTarget.style.borderColor = "#1890FF";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isLoading ? "Membuat Revisi..." : "Buat Revisi"}
        </Button>
      </Flex>
    </Modal>
  );
};

export default RevisionCreateModal;