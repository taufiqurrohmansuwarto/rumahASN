import {
  useChannel,
  useUpdateChannel,
  useDeleteChannel,
  useArchiveChannel,
  useUnarchiveChannel,
  useLeaveChannel,
} from "@/hooks/useRasnChat";
import { Modal, Form, Input, Select, Button, Popconfirm, Divider, message } from "antd";
import { Stack, Text, Group } from "@mantine/core";
import { IconTrash, IconArchive, IconLogout } from "@tabler/icons-react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const ChannelSettings = ({ channelId, open, onClose }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: channel, isLoading } = useChannel(channelId);
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();
  const archiveChannel = useArchiveChannel();
  const unarchiveChannel = useUnarchiveChannel();
  const leaveChannel = useLeaveChannel();

  useEffect(() => {
    if (channel) {
      form.setFieldsValue({
        name: channel.name,
        description: channel.description,
        type: channel.type,
      });
    }
  }, [channel, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateChannel.mutateAsync({ channelId, ...values });
      onClose();
    } catch (error) {
      if (error.errorFields) return;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChannel.mutateAsync(channelId);
      router.push("/rasn-chat");
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleArchive = async () => {
    try {
      if (channel?.is_archived) {
        await unarchiveChannel.mutateAsync(channelId);
      } else {
        await archiveChannel.mutateAsync(channelId);
      }
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleLeave = async () => {
    try {
      await leaveChannel.mutateAsync(channelId);
      router.push("/rasn-chat");
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Modal
      title="Pengaturan Channel"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={updateChannel.isLoading}
      okText="Simpan"
      cancelText="Batal"
      width={480}
    >
      <Form form={form} layout="vertical" size="small">
        <Form.Item
          name="name"
          label="Nama Channel"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="nama-channel" />
        </Form.Item>

        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea placeholder="Deskripsi channel (opsional)" rows={2} />
        </Form.Item>

        <Form.Item name="type" label="Tipe">
          <Select
            options={[
              { value: "public", label: "Public - Semua bisa join" },
              { value: "private", label: "Private - Hanya undangan" },
            ]}
          />
        </Form.Item>
      </Form>

      <Divider />

      <Stack gap="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Aksi</Text>

        <Button
          block
          icon={<IconArchive size={14} />}
          onClick={handleArchive}
          loading={archiveChannel.isLoading || unarchiveChannel.isLoading}
        >
          {channel?.is_archived ? "Aktifkan Channel" : "Arsipkan Channel"}
        </Button>

        <Button
          block
          icon={<IconLogout size={14} />}
          onClick={handleLeave}
          loading={leaveChannel.isLoading}
        >
          Keluar dari Channel
        </Button>

        <Popconfirm
          title="Hapus channel ini?"
          description="Semua pesan dan file akan dihapus permanen."
          onConfirm={handleDelete}
          okText="Ya, Hapus"
          cancelText="Batal"
          okButtonProps={{ danger: true }}
        >
          <Button
            block
            danger
            icon={<IconTrash size={14} />}
            loading={deleteChannel.isLoading}
          >
            Hapus Channel
          </Button>
        </Popconfirm>
      </Stack>
    </Modal>
  );
};

export default ChannelSettings;

