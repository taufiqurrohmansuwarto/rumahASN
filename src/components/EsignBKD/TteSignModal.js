import {
  Modal,
  Form,
  Input,
  Button,
  Flex,
  Alert,
  Card,
} from "antd";
import { Text, Title } from "@mantine/core";
import { IconSignature, IconKey, IconUser } from "@tabler/icons-react";
import { useState } from "react";

function TteSignModal({ open, onCancel, document, onSign, loading }) {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      await onSign({ id: document?.id, data: values });
      form.resetFields();
    } catch (error) {
      console.error("Sign error:", error);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
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
              backgroundColor: "#e6f7ff",
              borderRadius: "50%"
            }}
          >
            <IconSignature size={32} color="#1890ff" />
          </Flex>
          <Flex vertical>
            <Title order={3} style={{ margin: 0, color: "#1890ff" }}>
              Tanda Tangan Elektronik
            </Title>
            <Text size="sm" c="dimmed">
              Masukkan NIK dan passphrase untuk menandatangani
            </Text>
          </Flex>
        </Flex>

        <Card size="small">
          <Flex vertical gap="small">
            <Text fw={600} size="sm">{document?.title}</Text>
            <Text size="xs" c="dimmed">{document?.description}</Text>
          </Flex>
        </Card>

        <Alert
          message="Peringatan Tanda Tangan"
          description="Dengan menandatangani dokumen ini, Anda menyatakan persetujuan dan bertanggung jawab secara hukum atas isi dokumen."
          type="warning"
          showIcon
          style={{ borderRadius: 8 }}
        />

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="nik"
            label={
              <Flex align="center" gap="small">
                <IconUser size={16} />
                <Text size="sm" fw={500}>NIK</Text>
              </Flex>
            }
            rules={[
              { required: true, message: "NIK wajib diisi!" },
              { len: 16, message: "NIK harus 16 digit!" },
              { pattern: /^\d+$/, message: "NIK hanya boleh berisi angka!" }
            ]}
          >
            <Input
              placeholder="Masukkan 16 digit NIK"
              maxLength={16}
              style={{ height: 48, borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="passphrase"
            label={
              <Flex align="center" gap="small">
                <IconKey size={16} />
                <Text size="sm" fw={500}>Passphrase</Text>
              </Flex>
            }
            rules={[
              { required: true, message: "Passphrase wajib diisi!" },
              { min: 6, message: "Passphrase minimal 6 karakter!" }
            ]}
            help={
              <Text size="xs" c="dimmed">
                Masukkan passphrase sertifikat digital Anda
              </Text>
            }
          >
            <Input.Password
              placeholder="Masukkan passphrase"
              autoComplete="off"
              style={{ height: 48, borderRadius: 8 }}
            />
          </Form.Item>

          <Flex gap="middle" style={{ marginTop: 24 }}>
            <Button
              onClick={onCancel}
              style={{ flex: 1, height: 48, borderRadius: 8 }}
            >
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<IconSignature size={18} />}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 8,
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)"
              }}
            >
              Tanda Tangan
            </Button>
          </Flex>
        </Form>
      </Flex>
    </Modal>
  );
}

export default TteSignModal;