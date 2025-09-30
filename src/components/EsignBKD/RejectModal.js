import { Modal, Form, Input } from "antd";
import { Text, Alert } from "@mantine/core";
import { IconX, IconAlertCircle } from "@tabler/icons-react";

const RejectModal = ({ open, onCancel, onReject, loading = false }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onReject(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconX size={20} color="#fa5252" />
          <Text fw={600} size="md">Tolak Dokumen</Text>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Tolak Dokumen"
      cancelText="Batal"
      confirmLoading={loading}
      width={450}
      centered
      okButtonProps={{
        danger: true,
        style: {
          height: 36,
          borderRadius: 6,
        },
      }}
      cancelButtonProps={{
        style: {
          height: 36,
          borderRadius: 6,
        },
      }}
    >
      <div style={{ marginBottom: 16, padding: "8px 12px", background: "#fff7e6", borderRadius: 6, borderLeft: "3px solid #faad14" }}>
        <Text size="xs" c="dimmed">
          Penolakan akan menghentikan proses persetujuan. Berikan alasan yang jelas.
        </Text>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          label={<Text fw={500} size="sm">Alasan Penolakan</Text>}
          name="reason"
          rules={[
            { required: true, message: "Alasan penolakan wajib diisi" },
            { min: 10, message: "Alasan minimal 10 karakter" },
          ]}
        >
          <Input.TextArea
            placeholder="Jelaskan alasan penolakan dokumen ini..."
            rows={4}
            maxLength={1000}
            showCount
            style={{ borderRadius: 6 }}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 12, padding: "6px 12px", background: "#fff1f0", borderRadius: 6, borderLeft: "3px solid #ff4d4f" }}>
        <Text size="xs" c="dimmed">
          <IconAlertCircle size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Pembuat dokumen perlu membuat permintaan baru setelah ditolak.
        </Text>
      </div>
    </Modal>
  );
};

export default RejectModal;