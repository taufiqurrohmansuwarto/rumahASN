import {
  Modal,
  Button,
  Flex,
  Card,
} from "antd";
import { Text, Title } from "@mantine/core";
import { IconCheck, IconX, IconFileText } from "@tabler/icons-react";

function ReviewModal({ open, onCancel, document, onApprove, onReject, loading }) {

  const handleApprove = async () => {
    try {
      await onApprove({ id: document?.id, action: "approve" });
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleReject = async () => {
    try {
      await onReject({ id: document?.id, action: "reject" });
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
    >
      <Flex vertical gap="large">
        <Flex align="center" gap="middle" style={{ padding: "20px 0" }}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 60,
              height: 60,
              backgroundColor: "#fff7e6",
              borderRadius: "50%"
            }}
          >
            <IconFileText size={32} color="#fa8c16" />
          </Flex>
          <Flex vertical>
            <Title order={3} style={{ margin: 0, color: "#fa8c16" }}>
              Review Dokumen
            </Title>
            <Text size="sm" c="dimmed">
              Pilih tindakan untuk dokumen ini
            </Text>
          </Flex>
        </Flex>

        <Card
          size="small"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 12
          }}
        >
          <Flex vertical gap="small">
            <Text fw={600} size="sm" c="dark">
              {document?.title}
            </Text>
            {document?.description && (
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                {document?.description}
              </Text>
            )}
            <Flex gap="small" style={{ marginTop: 8 }}>
              <Text size="xs" c="dimmed">
                Dibuat: {new Date(document?.created_at).toLocaleDateString('id-ID')}
              </Text>
            </Flex>
          </Flex>
        </Card>

        <Flex vertical gap="middle">
          <Text size="sm" fw={500} ta="center" c="dark">
            Apakah Anda menyetujui dokumen ini?
          </Text>

          <Flex gap="middle">
            <Button
              onClick={handleReject}
              loading={loading}
              danger
              icon={<IconX size={18} />}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                border: "2px solid #ff4d4f",
                backgroundColor: "#fff1f0"
              }}
            >
              <Text size="sm" fw={500}>Tolak</Text>
            </Button>

            <Button
              type="primary"
              onClick={handleApprove}
              loading={loading}
              icon={<IconCheck size={18} />}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                border: "none"
              }}
            >
              <Text size="sm" fw={500} c="white">Setuju</Text>
            </Button>
          </Flex>
        </Flex>

        <Button
          onClick={onCancel}
          style={{
            width: "100%",
            height: 40,
            borderRadius: 8,
            border: "1px solid #d9d9d9"
          }}
        >
          <Text size="sm" c="dimmed">Batal</Text>
        </Button>
      </Flex>
    </Modal>
  );
}

export default ReviewModal;