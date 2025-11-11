import { Form, Input, Modal, Space } from "antd";
import { Text, Stack } from "@mantine/core";
import { IconLock, IconKey } from "@tabler/icons-react";

const ModalKonfirmasiSubmitPendidikan = ({
  open,
  onCancel,
  onOk,
  loading,
  form,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={loading}
      title={
        <Space>
          <IconLock size={18} />
          <span>Konfirmasi Submit</span>
        </Space>
      }
      width={450}
      centered
      okText="Submit"
      cancelText="Batal"
      okButtonProps={{ danger: true }}
    >
      <Stack spacing="md">
        <Text size="sm" c="dimmed">
          Masukkan passphrase dan OTP untuk submit usulan pendidikan
        </Text>
        <Form form={form} layout="vertical" size="small">
          <Form.Item
            name="passphrase"
            rules={[{ required: true, message: "Passphrase wajib diisi" }]}
            style={{ marginBottom: 12 }}
          >
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Passphrase
            </Text>
            <Input.Password
              size="small"
              placeholder="Passphrase SIASN"
              autoComplete="off"
              prefix={<IconKey size={14} />}
            />
          </Form.Item>
          <Form.Item
            name="one_time_code"
            rules={[{ required: true, message: "OTP wajib diisi" }]}
            style={{ marginBottom: 0 }}
          >
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              One Time Code (OTP)
            </Text>
            <Input
              size="small"
              placeholder="Kode OTP"
              autoComplete="off"
              prefix={<IconLock size={14} />}
            />
          </Form.Item>
        </Form>
      </Stack>
    </Modal>
  );
};

export default ModalKonfirmasiSubmitPendidikan;

