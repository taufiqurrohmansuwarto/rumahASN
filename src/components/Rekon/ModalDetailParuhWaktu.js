import { Badge, Text } from "@mantine/core";
import { Modal, Form, InputNumber, Button, Space } from "antd";
import { useEffect } from "react";

const ModalDetailParuhWaktu = ({ visible, onClose, data }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data && visible) {
      form.setFieldsValue({
        gaji: data?.gaji || data?.detail?.usulan_data?.data?.gaji_pokok || "0",
      });
    }
  }, [data, visible, form]);

  const handleSubmit = (values) => {
    console.log("Gaji baru:", values.gaji);
    // Di sini bisa tambahkan logic untuk save/update gaji
    onClose();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={450}
      centered
      styles={{
        body: { padding: "24px" },
      }}
    >
      {data && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <Text
              fw={700}
              size="lg"
              style={{ color: "#FF4500", display: "block", marginBottom: 4 }}
            >
              Detail Pegawai
            </Text>
            <Text size="xs" c="dimmed">
              Update informasi gaji pegawai
            </Text>
          </div>

          {/* Info Cards */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                  Nama
                </Text>
                <Text
                  size="sm"
                  fw={600}
                  style={{ display: "block", marginTop: 2 }}
                >
                  {data?.nama || "-"}
                </Text>
              </div>

              <div>
                <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                  NIP
                </Text>
                <Text
                  size="sm"
                  ff="monospace"
                  style={{ display: "block", marginTop: 2 }}
                >
                  {data?.nip || "-"}
                </Text>
              </div>

              <div>
                <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                  SIMASTER
                </Text>
                <div
                  style={{
                    marginTop: 4,
                    padding: "6px 10px",
                    backgroundColor: "#f0e6ff",
                    borderRadius: 6,
                    border: "1px solid #d3adf7",
                  }}
                >
                  <Text
                    size="10px"
                    ff="monospace"
                    style={{
                      color: "#722ed1",
                      wordBreak: "break-all",
                      lineHeight: 1.4,
                    }}
                  >
                    {data?.unor_simaster || "-"}
                  </Text>
                </div>
              </div>

              <div>
                <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                  SIASN
                </Text>
                <div
                  style={{
                    marginTop: 4,
                    padding: "6px 10px",
                    backgroundColor: "#e6f7ff",
                    borderRadius: 6,
                    border: "1px solid #91d5ff",
                    maxHeight: 60,
                    overflowY: "auto",
                  }}
                >
                  <Text
                    size="10px"
                    ff="monospace"
                    style={{
                      color: "#0958d9",
                      wordBreak: "break-all",
                      lineHeight: 1.4,
                    }}
                  >
                    {data?.unor_siasn || "-"}
                  </Text>
                </div>
              </div>
            </Space>
          </div>

          {/* Form Gaji */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div
              style={{
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Form.Item
                label={
                  <Text size="sm" fw={600} style={{ color: "#fa8c16" }}>
                    💰 Gaji Pokok
                  </Text>
                }
                name="gaji"
                rules={[{ required: true, message: "Gaji wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value) => value.replace(/Rp\s?|(\.*)/g, "")}
                  placeholder="Masukkan gaji pokok"
                />
              </Form.Item>
            </div>

            {/* Actions */}
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={onClose}>Batal</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                }}
              >
                Simpan Gaji
              </Button>
            </Space>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default ModalDetailParuhWaktu;
