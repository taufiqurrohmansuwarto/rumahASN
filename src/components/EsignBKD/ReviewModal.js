import {
  Modal,
  Button,
  Form,
  Input,
  message,
} from "antd";
import { Text, Stack } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

function ReviewModal({ open, onCancel, document, onApprove, loading }) {
  const [form] = Form.useForm();

  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await onApprove({
        id: document?.id,
        action: "approve",
        notes: values.notes
      });
      form.resetFields();
    } catch (error) {
      if (error?.errorFields) {
        console.error("Validation failed:", error);
      } else {
        message.error(error?.response?.data?.message || error?.message || "Review gagal");
      }
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Text fw={600} size="md">Review Dokumen</Text>
      }
      open={open}
      onCancel={handleModalCancel}
      footer={null}
      width={420}
      centered
    >
      <Stack gap="md">
        <div style={{ padding: "8px 12px", background: "#f0f5ff", borderRadius: 6, borderLeft: "3px solid #1677ff" }}>
          <Text size="xs" c="dimmed">
            Berikan catatan review jika diperlukan, lalu pilih tindakan.
          </Text>
        </div>

        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label={<Text size="sm" fw={500}>Catatan (Opsional)</Text>}
            name="notes"
          >
            <Input.TextArea
              placeholder="Tambahkan catatan review..."
              rows={3}
              maxLength={500}
              showCount
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
        </Form>

        <Stack gap="xs">
          <Button
            type="primary"
            icon={<IconCheck size={16} />}
            onClick={handleApprove}
            loading={loading}
            block
            style={{
              height: 36,
              borderRadius: 6,
              background: "#52c41a",
              borderColor: "#52c41a",
            }}
          >
            Setuju
          </Button>

        </Stack>
      </Stack>
    </Modal>
  );
}

export default ReviewModal;