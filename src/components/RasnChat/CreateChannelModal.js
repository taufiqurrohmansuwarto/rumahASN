import { useCreateChannel } from "@/hooks/useRasnChat";
import { Modal, Form, Input, Select, message } from "antd";
import { useRouter } from "next/router";

const CreateChannelModal = ({ open, onClose }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const createChannel = useCreateChannel();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const result = await createChannel.mutateAsync(values);
      form.resetFields();
      onClose();
      // Navigate to new channel
      if (result?.id) {
        router.push(`/rasn-chat/${result.id}`);
      }
    } catch (error) {
      if (error.errorFields) return;
      message.error("Gagal membuat channel");
    }
  };

  return (
    <Modal
      title="Buat Channel Baru"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createChannel.isLoading}
      okText="Buat"
      cancelText="Batal"
    >
      <Form form={form} layout="vertical" size="small">
        <Form.Item
          name="name"
          label="Nama Channel"
          rules={[
            { required: true, message: "Wajib diisi" },
            { pattern: /^[a-z0-9-]+$/, message: "Hanya huruf kecil, angka, dan strip" },
          ]}
        >
          <Input placeholder="contoh: tim-rekonsiliasi" />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea placeholder="Deskripsi channel (opsional)" rows={2} />
        </Form.Item>
        <Form.Item name="type" label="Tipe" initialValue="public">
          <Select
            options={[
              { value: "public", label: "Public - Semua orang bisa bergabung" },
              { value: "private", label: "Private - Hanya dengan undangan" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateChannelModal;
