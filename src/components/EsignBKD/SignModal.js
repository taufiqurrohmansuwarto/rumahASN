import { Modal, Form, Input, message } from "antd";
import { Text } from "@mantine/core";
import { IconShieldCheck, IconLock } from "@tabler/icons-react";

const SignModal = ({ open, onCancel, onSign, loading = false }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSign(values);
      message.success("Dokumen berhasil ditandatangani");
      form.resetFields();
    } catch (error) {
      // Only show error if it's not form validation error
      if (error?.errorFields) {
        console.error("Validation failed:", error);
      } else {
        message.error(error?.response?.data?.message || error?.message || "Tanda tangan gagal");
      }
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
          <IconShieldCheck size={20} color="#FF4500" />
          <Text fw={600} size="md">Tanda Tangan Elektronik</Text>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Tanda Tangan"
      cancelText="Batal"
      confirmLoading={loading}
      width={450}
      centered
      okButtonProps={{
        style: {
          background: "#FF4500",
          borderColor: "#FF4500",
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
      <div style={{ marginBottom: 16, padding: "8px 12px", background: "#f0f5ff", borderRadius: 6, borderLeft: "3px solid #1677ff" }}>
        <Text size="xs" c="dimmed">
          Masukkan passphrase Anda untuk menandatangani dokumen secara elektronik.
        </Text>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          label={<Text fw={500} size="sm">Passphrase</Text>}
          name="passphrase"
          rules={[
            { required: true, message: "Passphrase wajib diisi" },
            { min: 6, message: "Passphrase minimal 6 karakter" },
          ]}
        >
          <Input.Password
            prefix={<IconLock size={16} style={{ color: "#bfbfbf" }} />}
            placeholder="Masukkan passphrase"
            autoComplete="new-password"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          label={<Text fw={500} size="sm">Catatan (Opsional)</Text>}
          name="notes"
        >
          <Input.TextArea
            placeholder="Tambahkan catatan jika diperlukan"
            rows={3}
            maxLength={500}
            showCount
            style={{ borderRadius: 6 }}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 12, padding: "6px 12px", background: "#fffbf0", borderRadius: 6, borderLeft: "3px solid #faad14" }}>
        <Text size="xs" c="dimmed">
          <IconLock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Data passphrase terenkripsi dan aman.
        </Text>
      </div>
    </Modal>
  );
};

export default SignModal;